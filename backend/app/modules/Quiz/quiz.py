from datetime import datetime
import os
import re
import random
import json
from collections import defaultdict
from langchain_cohere import ChatCohere, CohereEmbeddings
from langchain_community.vectorstores import FAISS
from dotenv import load_dotenv

load_dotenv()


def normalize_subject_key(subject: str) -> str:
    """
    Canonical form for subject matching.
    'Computer-Graphics', 'Computer Graphics', 'computer_graphics'
      -> 'computergraphics'
    """
    return re.sub(r"[\s\-_]+", "", subject).lower()


def parse_json_response(text):
    text = re.sub(r'```json|```', '', text).strip()
    try:
        match = re.search(r'\[.*\]', text, re.DOTALL)
        if match:
            return json.loads(match.group())
        return json.loads(text)
    except json.JSONDecodeError as e:
        print(f"JSON parse error: {e}\nRaw text: {text[:200]}")
        return []


def validate_question(q):
    if not isinstance(q, dict):
        return False
    if not all(k in q for k in ["question", "options", "correct"]):
        return False
    if not isinstance(q["options"], dict) or set(q["options"].keys()) != {"A", "B", "C", "D"}:
        return False
    if q["correct"] not in ["A", "B", "C", "D"]:
        return False
    return True


def get_chunks_by_subject(subject_file, vectorStoreDB, unit_number=None):
    """
    Return a diverse sample of chunks for a subject.

    - Matches by canonical subject_key first, falls back to normalized comparison.
    - If unit_number is provided, filters to only that unit.
    """
    needle = normalize_subject_key(subject_file)
    all_documents = list(vectorStoreDB.docstore._dict.values())

    # Match by subject_key (preferred), subject, or source — all normalized
    subject_chunks = [
        doc for doc in all_documents
        if doc.metadata.get("subject_key") == needle
        or normalize_subject_key(doc.metadata.get("subject", "")) == needle
        or needle in normalize_subject_key(doc.metadata.get("source", ""))
    ]

    # Optional unit filter
    if unit_number is not None:
        subject_chunks = [
            doc for doc in subject_chunks
            if doc.metadata.get("unit_number") == unit_number
        ]

    if not subject_chunks:
        print(f"No chunks found for subject='{subject_file}', unit={unit_number}")
        return []

    # Group by Header 1 (unit header) so we get diversity across units
    groups = defaultdict(list)
    for chunk in subject_chunks:
        groups[chunk.metadata.get("Header 1", "Unknown")].append(chunk)

    # Sample up to 3 groups, then 1 chunk from each
    selected = []
    num_groups = min(3, len(groups))
    for header, chunks in random.sample(list(groups.items()), num_groups):
        selected.append(random.choice(chunks))

    return selected


def generate_quiz(subject_file, llm, vectorStoreDB, unit_number=None):
    chunks = get_chunks_by_subject(subject_file, vectorStoreDB, unit_number=unit_number)
    all_questions = []

    for chunk in chunks:
        prompt = f"""
You are a quiz generator.
Generate exactly 2 multiple choice questions based ONLY on the study material below.
Each question must have 1 correct and 3 believable wrong options.

Return ONLY a JSON array with no extra text, no markdown, no explanation.
Each object must have exactly these keys:
- "question": the question text
- "options": object with keys "A", "B", "C", "D"
- "correct": the letter of the correct option (A/B/C/D)
- "topic": the specific topic this question is about

Study material:
{chunk.page_content}
"""
        try:
            response = llm.invoke(prompt)
            questions = parse_json_response(response.content)
        except Exception as e:
            print(f"LLM error: {e}")
            continue

        for q in questions:
            if not validate_question(q):
                continue

            # Prefer LLM's own topic; fall back to metadata
            q['topic'] = q.get('topic') or chunk.metadata.get('topic') or chunk.metadata.get('Header 1', 'Unknown')
            q['header'] = chunk.metadata.get('Header 1', 'Unknown')
            q['chapter'] = chunk.metadata.get('Header 2', '')
            q['unit_number'] = chunk.metadata.get('unit_number')
            q['unit_name'] = chunk.metadata.get('unit_name', '')
            q['source'] = chunk.metadata.get('source', '')
            all_questions.append(q)

    if len(all_questions) < 5:
        print(f"Warning: Only generated {len(all_questions)} questions.")

    return random.sample(all_questions, min(5, len(all_questions)))


def evaluate_answers(quiz, student_answers, subject, user_id=None):
    results = []
    weak_topics = []

    for i, question in enumerate(quiz):
        student_answer = student_answers[i] if i < len(student_answers) else None
        is_correct = student_answer == question['correct']

        if not is_correct:
            topic_entry = {
                "topic": question["topic"],
                "source": question.get("source", "")
            }
            if topic_entry not in weak_topics:
                weak_topics.append(topic_entry)

        results.append({
            'question': question['question'],
            'your_answer': student_answer,
            'correct_answer': question['correct'],
            'is_correct': is_correct,
            'topic': question['topic']
        })

    save_quiz_history(subject, results, weak_topics[:10], user_id)
    return results, weak_topics


def save_quiz_history(subject, results, weak_topics, user_id=None):
    if not user_id:
        print("No user_id provided, skipping history save.")
        return
    try:
        from app.core.supabase_client import supabase
        supabase.table("quiz_history").insert({
            "user_id": user_id,
            "subject": subject,
            "score": sum(1 for r in results if r["is_correct"]),
            "total": len(results),
            "weak_topics": [t["topic"] for t in weak_topics]
        }).execute()
    except Exception as e:
        print(f"Failed to save quiz history: {e}")


def get_recommendations(weak_topics, vectorStoreDB):
    """
    Fetch a compact revision snippet for each weak topic.
    Returns the raw chunk content — the frontend renders it in an accordion.
    """
    recommendations = []
    for topic in weak_topics:
        query = f"{topic['topic']} {topic.get('source', '')}".strip()
        try:
            results = vectorStoreDB.similarity_search(query, k=1)
            if results:
                meta = results[0].metadata
                recommendations.append({
                    'weak_topic': topic['topic'],
                    'revise_this': results[0].page_content,
                    'source': meta.get('source', ''),
                    'unit': f"Unit {meta.get('unit_number', '?')}: {meta.get('unit_name', '')}".strip(": "),
                    'chapter': meta.get('chapter', ''),
                })
        except Exception as e:
            print(f"Recommendation error for {topic['topic']}: {e}")
    return recommendations