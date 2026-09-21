from datetime import datetime
import os
import json
import re

NOTES_DIR = "data/notes/"
TAGS_DIR = "tags/"
METADATA_FILE = "notes_metadata.json"


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------
def normalize_subject_key(subject: str) -> str:
    """Canonical subject key: 'Computer Graphics' -> 'computergraphics'."""
    return re.sub(r"[\s\-_]+", "", subject).lower()


def get_notes_faiss_path(user_id):
    return os.path.join("notes_faiss_index", str(user_id))


def generate_filename(subject):
    now = datetime.now().strftime("%Y-%m-%d-%H-%M-%S")
    # Sanitize subject for safe storage paths
    safe_subject = re.sub(r"[^\w\-]+", "-", subject).strip("-")
    return f"{now}_{safe_subject}.md"


def load_metadata():
    if not os.path.exists(METADATA_FILE):
        return []
    with open(METADATA_FILE, "r") as f:
        return json.load(f)


def save_metadata(metadata):
    with open(METADATA_FILE, "w") as f:
        json.dump(metadata, f, indent=2)


def load_tags(subject):
    """
    Return a flat list of tag strings for a subject.

    Handles two JSON shapes:
      1. { "tags": ["a", "b"] }
      2. { "units": [ { "topics": [ {"topic": "X", "tags": ["a","b"]} ] } ] }

    Also tolerates filename variations (Computer-Graphics.json vs ComputerGraphics.json)
    via normalize_subject_key.
    """
    tag_file = os.path.join(TAGS_DIR, f"{subject}.json")

    # Case-insensitive, separator-insensitive file lookup
    if not os.path.exists(tag_file) and os.path.exists(TAGS_DIR):
        needle = normalize_subject_key(subject)
        for fname in os.listdir(TAGS_DIR):
            if not fname.endswith(".json") or fname == "default.json":
                continue
            if normalize_subject_key(fname[:-5]) == needle:
                tag_file = os.path.join(TAGS_DIR, fname)
                break

    # Fallback to default.json
    if not os.path.exists(tag_file):
        default_file = os.path.join(TAGS_DIR, "default.json")
        if os.path.exists(default_file):
            with open(default_file, "r") as f:
                return json.load(f).get("tags", [])
        return []

    with open(tag_file, "r") as f:
        data = json.load(f)

    flat = set()

    # Shape 1: top-level "tags": [...]
    for t in data.get("tags", []) or []:
        if isinstance(t, str):
            flat.add(t)

    # Shape 2: "units" -> [ { "topics": [...] } ]
    for unit in data.get("units", []) or []:
        for entry in unit.get("topics", []) or []:
            if isinstance(entry, str):
                flat.add(entry)
            elif isinstance(entry, dict):
                # Prefer explicit tags array
                for tag in entry.get("tags", []) or []:
                    if isinstance(tag, str):
                        flat.add(tag)
                # Fallback: use topic name if no tags listed
                if not entry.get("tags") and isinstance(entry.get("topic"), str):
                    flat.add(entry["topic"])

    return sorted(flat)


# ---------------------------------------------------------------------------
# Supabase: create
# ---------------------------------------------------------------------------
def create_note(subject, title, content, tags, urls=None, user_id=None):
    from app.core.supabase_client import supabase

    if urls is None:
        urls = []

    word_count = len(content.split())
    if word_count > 500:
        return {"error": "Content exceeds 500 words limit."}

    filename = generate_filename(subject)
    now = datetime.now().strftime("%Y-%m-%d-%H-%M-%S")

    frontmatter = f"""---
title: {title}
subject: {subject}
tags: {json.dumps(tags)}
created_at: {now}
referenced_urls: {', '.join(urls)}
---
"""
    markdown_content = frontmatter + content

    try:
        supabase.storage.from_("notes").upload(
            path=f"{user_id}/{filename}",
            file=markdown_content.encode("utf-8"),
            file_options={
                "content-type": "text/markdown",
                "upsert": "false",
            },
        )
    except Exception as e:
        return {"error": f"Storage upload failed: {e}"}

    try:
        supabase.table("notes").insert({
            "user_id": user_id,
            "filename": filename,
            "subject": subject,
            "subject_key": normalize_subject_key(subject),
            "title": title,
            "tags": tags,
            "urls": urls,
            "word_count": word_count,
            "ingested": False,
        }).execute()
    except Exception as e:
        # Roll back storage upload if DB insert fails
        supabase.storage.from_("notes").remove([f"{user_id}/{filename}"])
        return {"error": f"DB insert failed: {e}"}

    return {"success": True, "filename": filename}


# ---------------------------------------------------------------------------
# Supabase: read
# ---------------------------------------------------------------------------
def get_all_notes(subject=None, tags=None, user_id=None):
    from app.core.supabase_client import supabase

    query = (
        supabase.table("notes")
        .select("*")
        .eq("user_id", user_id)
    )

    if subject:
        query = query.eq("subject_key", normalize_subject_key(subject))

    result = query.execute()
    notes = result.data

    if tags:
        notes = [
            note for note in notes
            if any(tag in note.get("tags", []) for tag in tags)
        ]
    return notes


def get_note_content(filename, user_id=None):
    from app.core.supabase_client import supabase

    results = (
        supabase.table("notes")
        .select("id")
        .eq("user_id", user_id)
        .eq("filename", filename)
        .execute()
    )
    if not results.data:
        return {"error": "Note not found"}

    try:
        file_data = supabase.storage.from_("notes").download(f"{user_id}/{filename}")
        return {"content": file_data.decode("utf-8")}
    except Exception as e:
        print(f"Storage download error: {e}")
        return {"error": "File not found in storage"}


# ---------------------------------------------------------------------------
# Supabase: update
# ---------------------------------------------------------------------------
def update_note(filename, title, content, tags, urls=None, user_id=None):
    from app.core.supabase_client import supabase

    if urls is None:
        urls = []

    word_count = len(content.split())
    if word_count > 500:
        return {"error": "Content exceeds 500 words limit."}

    results = (
        supabase.table("notes")
        .select("*")
        .eq("user_id", user_id)
        .eq("filename", filename)
        .execute()
    )
    if not results.data:
        return {"error": "Note not found"}

    note = results.data[0]
    subject = note["subject"]
    now = datetime.now().strftime("%Y-%m-%d-%H-%M-%S")

    frontmatter = f"""---
title: {title}
subject: {subject}
tags: {json.dumps(tags)}
updated_at: {now}
referenced_urls: {', '.join(map(str, urls))}
---
"""
    markdown_content = frontmatter + content

    # Upload with upsert=True — avoids destructive delete-then-upload
    try:
        supabase.storage.from_("notes").upload(
            path=f"{user_id}/{filename}",
            file=markdown_content.encode("utf-8"),
            file_options={
                "content-type": "text/markdown",
                "upsert": "true",
            },
        )
    except Exception as e:
        return {"error": f"Storage update failed: {e}"}

    try:
        supabase.table("notes").update({
            "title": title,
            "tags": tags,
            "urls": urls,
            "last_edited": datetime.now().isoformat(),
            "word_count": word_count,
            "ingested": False,
        }).eq("user_id", user_id).eq("filename", filename).execute()
    except Exception as e:
        return {"error": f"DB update failed: {e}"}

    return {"success": True}


# ---------------------------------------------------------------------------
# Supabase: delete
# ---------------------------------------------------------------------------
def delete_note(filename, user_id=None):
    from app.core.supabase_client import supabase

    results = (
        supabase.table("notes")
        .select("id")
        .eq("filename", filename)
        .eq("user_id", user_id)
        .execute()
    )
    if not results.data:
        return {"error": "Note not found"}

    try:
        supabase.storage.from_("notes").remove([f"{user_id}/{filename}"])
    except Exception as e:
        print(f"Storage delete warning: {e}")

    supabase.table("notes").delete().eq("filename", filename).eq("user_id", user_id).execute()
    return {"success": True}


# ---------------------------------------------------------------------------
# Subjects list
# ---------------------------------------------------------------------------
def get_subjects():
    """Return available subjects from tags/ folder."""
    if not os.path.exists(TAGS_DIR):
        return []
    return sorted([
        file[:-5]
        for file in os.listdir(TAGS_DIR)
        if file.endswith(".json") and file != "default.json"
    ])


# ---------------------------------------------------------------------------
# Tag generation
# ---------------------------------------------------------------------------
def generate_tags(note_content, subject, llm):
    subject_tags = load_tags(subject)
    if not subject_tags:
        return []

    preview = note_content[:1000]

    prompt = f"""You are a tagging system for study notes.
Select between 3 and 5 most relevant tags from the list below.
RULES:
- Return MINIMUM 3, MAXIMUM 5 tags
- ONLY use tags from predefined list
- Do NOT create new tags
- Return ONLY a JSON array

Predefined tags for {subject}:
{subject_tags}

Note content:
{preview}

Return format: ["tag1", "tag2", "tag3"]"""

    response = llm.invoke(prompt)

    try:
        from app.modules.Quiz.quiz import parse_json_response
        tags = parse_json_response(response.content)
        # Guard: ensure tags is a list of strings
        if not isinstance(tags, list):
            tags = []
        tags = [t for t in tags if isinstance(t, str)]

        valid_tags = [tag for tag in tags if tag in subject_tags]

        if len(valid_tags) < 3:
            valid_tags = subject_tags[:3]
        if len(valid_tags) > 5:
            valid_tags = valid_tags[:5]

        return valid_tags
    except Exception:
        return subject_tags[:3]


# ---------------------------------------------------------------------------
# URL title fetcher
# ---------------------------------------------------------------------------
def fetch_url_title(url):
    try:
        import requests
        from bs4 import BeautifulSoup
        response = requests.get(url, timeout=5)
        soup = BeautifulSoup(response.text, "html.parser")
        title = soup.title.string if soup.title else url
        return title.strip()
    except Exception:
        return url


# ---------------------------------------------------------------------------
# Notes ingestion (per user)
# ---------------------------------------------------------------------------
async def ingest_notes(embeddings, user_id=None):
    from langchain_core.documents import Document
    from langchain_text_splitters import MarkdownHeaderTextSplitter
    from langchain_community.vectorstores import FAISS
    from app.core.supabase_client import supabase

    # Fetch only notes that need ingestion
    results = (
        supabase.table("notes")
        .select("*")
        .eq("user_id", user_id)
        .eq("ingested", False)
        .execute()
    )

    if not results.data:
        return {"error": "No new notes to ingest"}

    notes = results.data
    documents = []

    for note in notes:
        filename = note["filename"]
        try:
            file_bytes = supabase.storage.from_("notes").download(f"{user_id}/{filename}")
            text = file_bytes.decode("utf-8")
            documents.append(Document(page_content=text, metadata={"source": filename}))
        except Exception as e:
            print(f"Failed to load {filename}: {e}")
            continue

    if not documents:
        return {"error": "No documents to ingest"}

    headers_to_split_on = [
        ("#", "Header 1"),
        ("##", "Header 2"),
        ("###", "Header 3"),
    ]
    splitter = MarkdownHeaderTextSplitter(headers_to_split_on=headers_to_split_on)

    all_chunks = []
    for doc in documents:
        chunks = splitter.split_text(doc.page_content)
        for chunk in chunks:
            chunk.metadata["source"] = doc.metadata["source"]
        all_chunks.extend(chunks)

    if not all_chunks:
        return {"error": "No chunks created"}

    faiss_path = get_notes_faiss_path(user_id)
    os.makedirs(faiss_path, exist_ok=True)
    index_file = os.path.join(faiss_path, "index.faiss")

    # Incremental: append if index exists
    if os.path.exists(index_file):
        vectorstore = FAISS.load_local(
            faiss_path,
            embeddings,
            allow_dangerous_deserialization=True,
        )
        vectorstore.add_documents(all_chunks)
    else:
        vectorstore = FAISS.from_documents(all_chunks, embeddings)

    vectorstore.save_local(faiss_path)

    # Mark only the ingested notes as True
    ingested_filenames = [n["filename"] for n in notes]
    supabase.table("notes").update({"ingested": True}) \
        .eq("user_id", user_id) \
        .in_("filename", ingested_filenames) \
        .execute()

    return {
        "success": True,
        "chunks_created": len(all_chunks),
        "notes_ingested": len(ingested_filenames),
    }