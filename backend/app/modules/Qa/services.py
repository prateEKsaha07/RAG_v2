import os
from typing import Optional

from langchain_community.vectorstores import FAISS

from app.core.rag import rag
from app.core.text_utils import normalize_subject_key

MAX_TURNS = 6

NOTES_ONLY_RULE = (
    "You must answer using ONLY the information present in the context below. "
    "Even if you know the answer from your own training knowledge, you are NOT allowed to use it here. "
    "This restriction applies to ALL questions, including general facts, current events, people, dates, or definitions — "
    "not just topics related to the student's subject. "
    "Before answering, check: is this fact explicitly present in the context? "
    "If it is not clearly present in the context, you MUST respond exactly: "
    "\"I don't have enough information in your notes to answer that.\" "
    "Do not guess, do not fill gaps with outside knowledge, do not explain that you know the answer elsewhere."
)

GENERAL_KNOWLEDGE_RULE = (
    "Answer using the context below if it's relevant. You may also use your own general "
    "knowledge to answer fully. If you go beyond the provided notes, briefly mention that "
    "this part is from general knowledge, not the student's notes."
)

EXPORT_TRIGGERS = ["export chat", "export conversation", "give me context", "/export"]

# Helpers

def _dedupe_docs(docs, key_fn=None):
    if key_fn is None:
        key_fn = lambda d: (d.metadata.get("source", ""), d.page_content[:100])
    seen = set()
    out = []
    for d in docs:
        k = key_fn(d)
        if k not in seen:
            seen.add(k)
            out.append(d)
    return out


def _format_context(docs):
    parts = []
    for i, doc in enumerate(docs, 1):
        meta = doc.metadata
        source = meta.get("source", "unknown")
        unit = meta.get("unit_number")
        unit_name = meta.get("unit_name", "")
        chapter = meta.get("chapter", "")
        topic = meta.get("topic", "")

        label_bits = [f"[{i}] {source}"]
        if unit:
            label_bits.append(f"Unit {unit}" + (f": {unit_name}" if unit_name else ""))
        if chapter:
            label_bits.append(chapter)
        if topic:
            label_bits.append(topic)
        label = " › ".join(label_bits)

        parts.append(f"{label}\n{doc.page_content}")

    return "\n\n---\n\n".join(parts)


def _build_sources(docs):
    sources = []
    seen = set()
    for doc in docs:
        meta = doc.metadata
        key = (meta.get("source"), meta.get("unit_number"), meta.get("topic"))
        if key in seen:
            continue
        seen.add(key)
        sources.append({
            "file": meta.get("source", ""),
            "subject": meta.get("subject", ""),
            "unit_number": meta.get("unit_number"),
            "unit_name": meta.get("unit_name", ""),
            "chapter": meta.get("chapter", ""),
            "topic": meta.get("topic", ""),
        })
    return sources


def _format_history(session_id, n=MAX_TURNS):
    history = rag.chat_histories.get(session_id, [])
    recent = history[-n:]
    if not recent:
        return ""
    return "\n".join(
        f"{turn['role'].capitalize()}: {turn['content']}" for turn in recent
    )


def _save_turn(session_id, role, content, max_store_len=300):
    if role == "assistant" and len(content) > max_store_len:
        content = content[:max_store_len] + "..."
    rag.chat_histories.setdefault(session_id, []).append(
        {"role": role, "content": content}
    )


def _export_context(session_id):
    history = rag.chat_histories.get(session_id, [])
    if not history:
        return {
            "answer": "No conversation yet to export.",
            "sources": [],
            "context_used": 0,
            "confidence": "low",
        }

    lines = ["Here is our conversation so far:\n"]
    for turn in history:
        lines.append(f"{turn['role'].capitalize()}: {turn['content']}")
    lines.append("\nPlease continue this conversation from where it left off.")
    text = "\n".join(lines)

    return {
        "answer": text,
        "sources": [],
        "context_used": 0,
        "confidence": "high",
    }


def _get_or_load_notes_db(user_id, embeddings):
    """
    Return the user's notes FAISS if already in rag.notes_dbs, else try
    to load from disk (once) and cache. Returns None if no index exists.
    """
    from app.modules.Notes.notes import get_notes_faiss_path

    cached = rag.notes_dbs.get(user_id)
    if cached is not None:
        return cached

    notes_path = get_notes_faiss_path(user_id)
    index_file = os.path.join(notes_path, "index.faiss")
    if not os.path.exists(index_file):
        return None

    try:
        db = FAISS.load_local(
            notes_path,
            embeddings,
            allow_dangerous_deserialization=True,
        )
        rag.notes_dbs[user_id] = db
        return db
    except Exception as e:
        print(f"Notes FAISS load failed: {e}")
        return None


def _search_uploads_filtered(uploads_db, embeddings, question, subject, k):
    """
    Search the shared uploads index. If subject is given, restrict results to
    that subject's chunks. Uses over-fetch + post-filter instead of rebuilding
    a temporary FAISS index (which re-embeds docs on every call).
    """
    if not subject:
        return uploads_db.similarity_search(question, k=k)

    needle = normalize_subject_key(subject)

    def matches(doc):
        key = doc.metadata.get("subject_key") or normalize_subject_key(
            doc.metadata.get("subject", "")
        )
        return key == needle

    candidates = uploads_db.similarity_search(question, k=max(k * 3, 15))
    filtered = [d for d in candidates if matches(d)]

    # Fallback: if filter ate everything, return unfiltered top-k
    return filtered[:k] if filtered else uploads_db.similarity_search(question, k=k)


# Main QA function

def get_answer(
    question: str,
    llm,
    uploads_db,
    user_id,
    embeddings,
    session_id: Optional[str] = None,
    subject: Optional[str] = None,
    general_knowledge: bool = False,
    k: int = 5,
):
    if not question or not question.strip():
        return {
            "answer": "Please ask a question.",
            "sources": [],
            "context_used": 0,
            "confidence": "low",
        }

    if question.strip().lower() in EXPORT_TRIGGERS:
        return _export_context(session_id)

    notes_docs = []
    uploads_docs = []

    # 1. User notes
    notes_db = _get_or_load_notes_db(user_id, embeddings)
    if notes_db is not None:
        try:
            notes_docs = notes_db.similarity_search(question, k=k)
        except Exception as e:
            print(f"Notes FAISS search failed: {e}")
            notes_docs = []

    # 2. Shared uploads
    if uploads_db is not None:
        try:
            uploads_docs = _search_uploads_filtered(
                uploads_db, embeddings, question, subject, k
            )
        except Exception as e:
            print(f"Uploads FAISS search failed: {e}")
            uploads_docs = []

    # 3. Combine + dedupe
    all_docs = _dedupe_docs(notes_docs + uploads_docs)

    if not all_docs:
        return {
            "answer": "I don't have enough information in your notes or uploads to answer that.",
            "sources": [],
            "context_used": 0,
            "confidence": "low",
        }

    # 4. Build context + history
    context = _format_context(all_docs)
    history_text = _format_history(session_id)

    # 5. Prompt
    rule = GENERAL_KNOWLEDGE_RULE if general_knowledge else NOTES_ONLY_RULE

    prompt = f"""You are a helpful study assistant for a student.
{rule}

RULES:
- Keep the answer to 2-4 sentences.
- Paraphrase in your own words — no bullet points, no headers, no markdown.
- If the context contains references to specific algorithms, formulas, or definitions, mention them precisely.
- Do NOT repeat the question.
- Use chat history only to resolve references (e.g. "it", "that"). Do not answer from history alone.

Chat history:
{history_text if history_text else "(none)"}

Context:
{context}

Question: {question}

Answer:
"""

    # 6. Invoke
    try:
        response = llm.invoke(prompt)
        answer = response.content.strip()
    except Exception as e:
        print(f"LLM invoke failed: {e}")
        return {
            "answer": "Sorry, I couldn't generate an answer right now. Please try again.",
            "sources": _build_sources(all_docs),
            "context_used": len(all_docs),
            "confidence": "low",
        }

    # 7. Confidence heuristic
    if "don't have enough information" in answer.lower():
        confidence = "low"
    elif len(all_docs) >= 4:
        confidence = "high"
    else:
        confidence = "medium"

    _save_turn(session_id, "user", question)
    _save_turn(session_id, "assistant", answer)

    return {
        "answer": answer,
        "sources": _build_sources(all_docs),
        "context_used": len(all_docs),
        "confidence": confidence,
    }