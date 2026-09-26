from dotenv import load_dotenv
import os
import re
from app.modules.Notes.notes import get_notes_faiss_path
from langchain_community.vectorstores import FAISS

load_dotenv()

# memory management
MAX_TURNS = 6
chat_histories = {}
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

# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------
def normalize_subject_key(subject: str) -> str:
    """Canonical form for subject matching."""
    return re.sub(r"[\s\-_]+", "", subject).lower()

def _dedupe_docs(docs, key_fn=None):
    """Remove duplicate docs based on a key function (default: source + first 100 chars)."""
    if key_fn is None:
        key_fn = lambda d: (
            d.metadata.get("source", ""),
            d.page_content[:100],
        )
    seen = set()
    out = []
    for d in docs:
        k = key_fn(d)
        if k not in seen:
            seen.add(k)
            out.append(d)
    return out

def _format_context(docs):
    """Format retrieved docs with metadata labels for the LLM."""
    parts = []
    for i, doc in enumerate(docs, 1):
        meta = doc.metadata
        source = meta.get("source", "unknown")
        unit = meta.get("unit_number")
        unit_name = meta.get("unit_name", "")
        chapter = meta.get("chapter", "")
        topic = meta.get("topic", "")

        # Build a compact label
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
    """Produce structured source list with unit/chapter info."""
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
# new 
def _format_history(session_id, n = MAX_TURNS):
    """Returns last turns as plain text for the prompt."""
    history = chat_histories.get(session_id,[])
    recent = history[-n:]
    if not recent:
        return ""
    lines = [f"{turn['role'].capitalize()}: {turn['content']}"for turn in recent]
    return "\n".join(lines)

def _save_turn(session_id, role, content, max_store_len=300):
    """Append a turn to full history. Truncate long assistant answers before storing."""
    if role == "assistant" and len(content) > max_store_len:
        content = content[:max_store_len] + "..."
    chat_histories.setdefault(session_id, []).append({"role": role, "content": content})

def _export_context(session_id):
    history = chat_histories.get(session_id, [])
    if not history:
        return {"answer": "No conversation yet to export.", "sources": [], "context_used": 0, "confidence": "low"}

    lines = ["Here is our conversation so far:\n"]
    for turn in history:
        lines.append(f"{turn['role'].capitalize()}: {turn['content']}")
    lines.append("\nPlease continue this conversation from where it left off.")
    text = "\n".join(lines)

    return {"answer": text, "sources": [], "context_used": 0, "confidence": "high"}

# ---------------------------------------------------------------------------
# Main QA function
# ---------------------------------------------------------------------------
def get_answer(
    question,
    llm,
    uploads_db,
    user_id,
    embeddings,
    session_id = str,
    subject: str | None = None,
    general_knowledge: bool = False,
    k: int = 5,
):
    """
    Retrieve relevant context from user notes + shared uploads, then answer.

    Args:
        question: user's question text
        llm: LangChain LLM instance
        uploads_db: shared FAISS vectorstore (Computer Graphics, etc.)
        user_id: current user's ID
        embeddings: Cohere embeddings instance
        subject: optional subject filter ('Computer Graphics', etc.)
        k: number of docs per source (default 5)

    Returns:
        dict with answer, sources, context_used, confidence
    """

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

    # -----------------------------------------------------------------------
    # 1. Retrieve from user's notes FAISS (per-user index)
    # -----------------------------------------------------------------------
    notes_path = get_notes_faiss_path(user_id)
    notes_index_file = os.path.join(notes_path, "index.faiss")

    if os.path.exists(notes_index_file):
        try:
            notes_db = FAISS.load_local(
                notes_path,
                embeddings,
                allow_dangerous_deserialization=True,
            )
            notes_docs = notes_db.similarity_search(question, k=k)
        except Exception as e:
            print(f"Notes FAISS load/search failed: {e}")
            notes_docs = []
    # -----------------------------------------------------------------------
    # 2. Retrieve from shared uploads FAISS
    # -----------------------------------------------------------------------
    if uploads_db is not None:
        try:
            if subject:
                # Filter by subject_key if available in metadata
                needle = normalize_subject_key(subject)
                all_docs = list(uploads_db.docstore._dict.values())
                filtered = [
                    d for d in all_docs
                    if (d.metadata.get("subject_key") or normalize_subject_key(d.metadata.get("subject", ""))) == needle
                ]
                if filtered:
                    # Build a temporary sub-index for filtered similarity search
                    filtered_db = FAISS.from_documents(filtered, embeddings)
                    uploads_docs = filtered_db.similarity_search(question, k=k)
                else:
                    uploads_docs = uploads_db.similarity_search(question, k=k)
            else:
                uploads_docs = uploads_db.similarity_search(question, k=k)
        except Exception as e:
            print(f"Uploads FAISS search failed: {e}")
            uploads_docs = []

    # -----------------------------------------------------------------------
    # 3. Combine + dedupe
    # -----------------------------------------------------------------------
    all_docs = _dedupe_docs(notes_docs + uploads_docs)

    if not all_docs:
        return {
            "answer": "I don't have enough information in your notes or uploads to answer that.",
            "sources": [],
            "context_used": 0,
            "confidence": "low",
        }

    # -----------------------------------------------------------------------
    # 4. Build context with labels
    # -----------------------------------------------------------------------
    context = _format_context(all_docs)
    history_text = _format_history(session_id)

    # -----------------------------------------------------------------------
    # 5. Build prompt
    # -----------------------------------------------------------------------

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

    # -----------------------------------------------------------------------
    # 6. Invoke LLM
    # -----------------------------------------------------------------------
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

    # -----------------------------------------------------------------------
    # 7. Compute confidence heuristic
    # -----------------------------------------------------------------------
    if "don't have enough information" in answer.lower():
        confidence = "low"
    elif len(all_docs) >= 4:
        confidence = "high"
    else:
        confidence = "medium"

# saving responses 
    _save_turn(session_id,"user",question)
    _save_turn(session_id,"assistant",answer)
    # print(chat_histories)

    return {
        "answer": answer,
        "sources": _build_sources(all_docs),
        "context_used": len(all_docs),
        "confidence": confidence,
    }