import os
import re
import random
import json
from langchain_cohere import ChatCohere
from langchain_community.vectorstores import FAISS
from dotenv import load_dotenv
from langchain_cohere import CohereEmbeddings
load_dotenv()

embeddings = CohereEmbeddings(
    model="embed-english-light-v3.0",
    cohere_api_key=os.getenv("COHERE_API_KEY")
)

vectorStoreDB =FAISS.load_local("faiss_index",embeddings,allow_dangerous_deserialization=True)
llm = ChatCohere(
    model="command-r7b-12-2024",
    cohere_api_key=os.getenv("COHERE_API_KEY")
)
docs = vectorStoreDB.docstore._dict

def parse_json_response(text):
    text = re.sub(r'```json|```', '', text).strip()
    match = re.search(r'\[.*\]', text, re.DOTALL)
    if match:
        return json.loads(match.group())
    return json.loads(text)

def get_chunks_by_subject(subject_file):
    all_documents = list(vectorStoreDB.docstore._dict.values())
    subject_chunks = [doc for doc in all_documents if subject_file in doc.metadata.get("source", "")]
    selected = random.sample(subject_chunks, min(3, len(subject_chunks)))
    return selected

def generate_quiz(subject_file):
    chunks = get_chunks_by_subject(subject_file)
    
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
        response = llm.invoke(prompt)
        questions = parse_json_response(response.content)
        for question in questions:
            question['topic'] = chunk.metadata.get('Header 1', 'Unknown')
            question['source'] = chunk.metadata.get('source', '')
        
        all_questions.extend(questions)
    

    return random.sample(all_questions, min(5, len(all_questions)))

def evaluate_answers(quiz, student_answers):
    results = []
    weak_topics = []
    
    for i, question in enumerate(quiz):
        is_correct = student_answers[i] == question['correct']
        
        if not is_correct:
            topic_entry = {
                "topic":question["topic"],
                "source":question["source"]
            }
            if topic_entry not in weak_topics:
                weak_topics.append(topic_entry)

        results.append({
            'question': question['question'],
            'your_answer': student_answers[i],
            'correct_answer': question['correct'],
            'is_correct': is_correct,
            'topic': question['topic']
        })
    
    return results, weak_topics


def get_recommendations(weak_topics):
    recommendations = []
    
    for topic in weak_topics:
        results = vectorStoreDB.similarity_search(topic["topic"], k=1)
        
        if results:
            recommendations.append({
                'weak_topic': topic['topic'],
                'revise_this': results[0].page_content,
                'source': results[0].metadata.get('source', '')
            })
    
    return recommendations
