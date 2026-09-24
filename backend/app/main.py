from datetime import datetime
import json
import os
import re
from pathlib import Path
from typing import List, Any
import shutil

from dotenv import load_dotenv

from fastapi import FastAPI, UploadFile, File, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from app.core.auth import get_current_user

load_dotenv()

# Heavy objects start as None and get populated in lifespan() after the
# server is already accepting connections. This keeps cold start fast.
embeddings = None
vectorStoreDB = None
llm = None
notes_db = None

from contextlib import asynccontextmanager

# Subject key normalization — canonical form for matching across files/DB
def normalize_subject_key(subject: str) -> str:
    """
    'Computer-Graphics', 'Computer Graphics', 'computer_graphics'
      -> 'computergraphics'
    """
    return re.sub(r"[\s\-_]+", "", subject).lower()


# Safe FAISS loader — won't crash if index is missing
def _load_faiss_safe(path: str):
    """
    Load a FAISS index if it exists, otherwise return None.
    Prevents startup crash when faiss_index/ hasn't been built yet.
    """
    from langchain_community.vectorstores import FAISS

    index_file = os.path.join(path, "index.faiss")
    if not os.path.exists(index_file):
        print(f"FAISS index not found at '{path}'. Skipping load.")
        return None

    try:
        db = FAISS.load_local(
            path,
            embeddings,
            allow_dangerous_deserialization=True,
        )
        print(f"FAISS index loaded from '{path}'.")
        return db
    except Exception as e:
        print(f"Failed to load FAISS from '{path}': {e}")
        return None


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Runs after uvicorn has opened the socket. /health can respond immediately
    while the RAG stack loads in the background.
    """
    global embeddings, vectorStoreDB, llm, notes_db

    print("Starting server...")
    print("API Key exists:", bool(os.getenv("COHERE_API_KEY")))

    from langchain_cohere import CohereEmbeddings, ChatCohere

    embeddings = CohereEmbeddings(
        model="embed-english-light-v3.0",
        cohere_api_key=os.getenv("COHERE_API_KEY"),
    )

    vectorStoreDB = _load_faiss_safe("faiss_index")

    llm = ChatCohere(
        model="command-r7b-12-2024",
        cohere_api_key=os.getenv("COHERE_API_KEY"),
    )

    print("RAG stack loaded")

    yield

    print("Shutting down...")

app = FastAPI(lifespan=lifespan)

# Request models
class QuizRequest(BaseModel):
    subject: str
    unit_number: int | None = None
class EvaluateRequest(BaseModel):
    quiz: list[Any]
    answers: list[Any]
    subject: str
class AskRequest(BaseModel):
    question: str
    subject: str | None = None 
class GenerateTagsRequest(BaseModel):
    note_content: str
    subject: str
class SubjectTagsRequest(BaseModel):
    subject: str
class FetchURLRequest(BaseModel):
    url: str
class UpdateNoteRequest(BaseModel):
    title: str
    content: str
    tags: List[str]
    urls: List[Any] = []
class CreateNoteRequest(BaseModel):
    subject: str
    title: str
    content: str
    tags: List[str]
    urls: List[Any] = []
class RoadmapRequest(BaseModel):
    subject: str
    hours_per_day: int
    target_date: str
    scope: str
    unit_number: int | None = None
class ExtendDateRequest(BaseModel):
    new_target_date: str
class CompleteTopicRequest(BaseModel):
    week: int
    topic_name: str

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def home():
    return {"message": "Server Online"}


@app.get("/health")
def health():
    """Responds instantly, even before the RAG stack finishes loading."""
    return {
        "status": "ok",
        "ready": vectorStoreDB is not None,
    }


# Unit-wise metadata endpoint
@app.get("/subjects/{subject}/units")
def get_subject_units(subject: str):
    """
    Return the list of units available for a subject, based on the ingested
    FAISS metadata. Tolerates subject name variations.
    """
    if vectorStoreDB is None:
        return {"error": "Vector store not ready"}

    needle = normalize_subject_key(subject)
    all_docs = list(vectorStoreDB.docstore._dict.values())
    units = {}
    canonical_name = None

    for doc in all_docs:
        meta = doc.metadata
        haystack = meta.get("subject_key") or normalize_subject_key(meta.get("subject", ""))
        if haystack != needle:
            continue

        canonical_name = canonical_name or meta.get("subject", subject)
        unit_number = meta.get("unit_number")
        if unit_number is None:
            continue

        units[unit_number] = {
            "unit_number": unit_number,
            "unit_name": meta.get("unit_name") or f"Unit {unit_number}",
        }

    return {
        "subject": canonical_name or subject,
        "subject_key": needle,
        "units": sorted(units.values(), key=lambda u: u["unit_number"]),
    }

# Quiz
@app.post("/generate-quiz")
def generateQuiz(request: QuizRequest, user=Depends(get_current_user)):
    from app.modules.Quiz.quiz import generate_quiz
    if vectorStoreDB is None:
        return {"error": "Vector store not ready. Please ingest documents first."}

    quiz = generate_quiz(
        request.subject,
        llm,
        vectorStoreDB,
        unit_number=request.unit_number,
    )
    return {"quiz": quiz}


@app.post("/evaluate")
async def evaluate_endpoint(request: EvaluateRequest, user=Depends(get_current_user)):
    from app.modules.Quiz.quiz import evaluate_answers, get_recommendations
    results, weak_topics = evaluate_answers(
        request.quiz,
        request.answers,
        request.subject,
        user_id=user.id,
    )
    recommendations = get_recommendations(weak_topics, vectorStoreDB)
    return {
        "results": results,
        "weak_topics": weak_topics,
        "recommendations": recommendations,
    }


@app.get("/quiz-history")
def get_quiz_history(subject: str = None):
    history_file = "analytics/quiz_history.json"
    if not os.path.exists(history_file):
        return {"history": []}
    with open(history_file, "r") as f:
        history = json.load(f)
    if subject:
        needle = normalize_subject_key(subject)
        history = [
            h for h in history
            if normalize_subject_key(h.get("subject", "")) == needle
        ]
    return {"history": history}


# Ingestion
@app.post("/ingest")
def ingestion(file: UploadFile = File(...)):
    from app.modules.Ingestion.ingestion import run_ingestion

    file_path = f"data/uploads/{file.filename}"
    with open(file_path, "wb") as f:
        shutil.copyfileobj(file.file, f)

    chunk_count = run_ingestion()

    # Reload FAISS after ingestion
    global vectorStoreDB
    vectorStoreDB = _load_faiss_safe("faiss_index")

    return {
        "message": f"{file.filename} ingested successfully",
        "chunks_created": chunk_count,
        "vector_store_ready": vectorStoreDB is not None,
    }

# Q&A — upgraded to accept optional subject scope
@app.post("/ask")
def ask_endpoint(request: AskRequest, user=Depends(get_current_user)):
    from app.modules.Qa.query import get_answer
    response = get_answer(
        question=request.question,
        llm=llm,
        uploads_db=vectorStoreDB,
        user_id=user.id,
        embeddings=embeddings,
        subject=request.subject,
    )
    return response

# Notes — specific routes MUST come before /notes/{filename}
@app.post("/notes/generate-tags")
def generate_tags_endpoint(request: GenerateTagsRequest):
    from app.modules.Notes.notes import generate_tags
    tags = generate_tags(request.note_content, request.subject, llm)
    return {"tags": tags}

@app.post("/notes/fetch-url")
def fetch_url_endpoint(request: FetchURLRequest):
    from app.modules.Notes.notes import fetch_url_title
    return {"title": fetch_url_title(request.url)}

@app.post("/notes/subject-tags")
def get_subject_tags_endpoint(request: SubjectTagsRequest):
    """
    Return the full tag pool for a subject WITHOUT calling the LLM.
    Reads from tags/<subject>.json (or default.json fallback).
    """
    from app.modules.Notes.notes import load_tags
    return {"tags": load_tags(request.subject)}

@app.post("/notes/ingest")
async def ingest_notes_endpoint(user=Depends(get_current_user)):
    from app.modules.Notes.notes import ingest_notes, get_notes_faiss_path
    from langchain_community.vectorstores import FAISS

    result = await ingest_notes(embeddings, user.id)

    if "error" in result:
        return result

    global notes_db
    notes_db = FAISS.load_local(
        get_notes_faiss_path(user.id),
        embeddings,
        allow_dangerous_deserialization=True,
    )
    return result

@app.post("/notes")
def create_note_endpoint(request: CreateNoteRequest, user=Depends(get_current_user)):
    from app.modules.Notes.notes import create_note
    return create_note(
        subject=request.subject,
        title=request.title,
        content=request.content,
        tags=request.tags,
        urls=request.urls,
        user_id=user.id,
    )

@app.get("/notes")
def get_notes_endpoint(subject: str = None, tags: str = None, user=Depends(get_current_user)):
    from app.modules.Notes.notes import get_all_notes
    tag_list = tags.split(",") if tags else None
    notes = get_all_notes(subject, tag_list, user_id=user.id)
    return {"notes": notes}


@app.get("/notes/{filename}")
def get_note_content_endpoint(filename: str, user=Depends(get_current_user)):
    from app.modules.Notes.notes import get_note_content
    return get_note_content(filename, user_id=user.id)


@app.put("/notes/{filename}")
def update_note_endpoint(filename: str, request: UpdateNoteRequest, user=Depends(get_current_user)):
    from app.modules.Notes.notes import update_note
    return update_note(
        filename=filename,
        title=request.title,
        content=request.content,
        tags=request.tags,
        urls=request.urls,
        user_id=user.id,
    )


@app.delete("/notes/{filename}")
def delete_note_endpoint(filename: str, user=Depends(get_current_user)):
    from app.modules.Notes.notes import delete_note
    return delete_note(filename, user_id=user.id)

# Subjects & uploads
@app.get("/subjects")
def get_subjects_endpoint():
    from app.modules.Notes.notes import get_subjects
    return {"subjects": get_subjects()}

@app.get("/uploads/{subject}")
def get_upload_content(subject: str):
    """
    Return the content of the uploaded .md file for a subject.
    Tolerates subject name variations (Computer-Graphics = Computer Graphics).
    Also returns filename, size, and uploaded_at for UI display.
    """
    needle = normalize_subject_key(subject)
    uploads_dir = Path("data/uploads")

    if not uploads_dir.exists():
        return {"error": "No uploads directory found"}

    match = None
    for file in uploads_dir.glob("*.md"):
        if normalize_subject_key(file.stem) == needle:
            match = file
            break

    if not match:
        return {"error": f"No upload found for subject '{subject}'"}

    try:
        content = match.read_text(encoding="utf-8")
        stat = match.stat()
        return {
            "content": content,
            "filename": match.name,
            "size": stat.st_size,
            "uploaded_at": datetime.fromtimestamp(stat.st_mtime).strftime("%Y-%m-%d"),
        }
    except Exception as e:
        return {"error": f"Failed to read upload: {e}"}


@app.get("/uploads")
def get_uploaded_subjects():
    files = []
    for file in Path("data/uploads").glob("*.md"):
        files.append(file.stem)
    return sorted(files)

# Roadmap
@app.post("/roadmap")
def generate_roadmap_endpoint(request: RoadmapRequest, user=Depends(get_current_user)):
    from app.modules.Roadmap.roadmap import generate_roadmap, check_existing_roadmap

    if vectorStoreDB is None:
        return {"error": "Vector store not ready. Please ingest documents first."}

    if check_existing_roadmap(request.subject, user_id=user.id):
        return {"error": "Active roadmap exists. Complete or delete it first."}

    result = generate_roadmap(
        subject=request.subject,
        hours_per_day=request.hours_per_day,
        target_date=request.target_date,
        scope=request.scope,
        unit_number=request.unit_number,
        llm=llm,
        user_id=user.id,
        vectorStoreDB=vectorStoreDB,
    )
    return result

@app.get("/roadmap/{subject}")
def get_roadmap_endpoint(subject: str, user=Depends(get_current_user)):
    from app.modules.Roadmap.roadmap import load_roadmap
    roadmap = load_roadmap(subject, user_id=user.id)
    if not roadmap:
        return {"error": "No roadmap found"}
    return roadmap

@app.delete("/roadmap/{subject}")
def delete_roadmap_endpoint(subject: str, user=Depends(get_current_user)):
    from app.core.supabase_client import supabase
    needle = normalize_subject_key(subject)
    supabase.table("roadmaps")\
        .delete()\
        .eq("user_id", user.id)\
        .eq("subject_key", needle)\
        .execute()
    return {"success": True, "message": f"Roadmap for {subject} deleted"}

@app.put("/roadmap/{subject}/extend")
def extend_roadmap_endpoint(subject: str, request: ExtendDateRequest, user=Depends(get_current_user)):
    from app.core.supabase_client import supabase
    from app.modules.Roadmap.roadmap import load_roadmap

    roadmap = load_roadmap(subject, user_id=user.id)
    if not roadmap:
        return {"error": "No roadmap found"}

    supabase.table("roadmaps").update({
        "target_date": request.new_target_date
    }).eq("id", roadmap["id"]).execute()

    return {"success": True, "new_target_date": request.new_target_date}

@app.put("/roadmap/{subject}/complete-topic")
def complete_topic_endpoint(subject: str, request: CompleteTopicRequest, user=Depends(get_current_user)):
    from app.core.supabase_client import supabase
    from app.modules.Roadmap.roadmap import load_roadmap

    roadmap = load_roadmap(subject, user_id=user.id)
    if not roadmap:
        return {"error": "No roadmap found"}

    found = False
    for week in roadmap["weeks"]:
        if week["week"] == request.week:
            for item in week["topics"]:
                if item["topic"]["name"] == request.topic_name:
                    item["topic"]["status"] = "completed"
                    item["topic"]["completed_date"] = datetime.now().strftime("%Y-%m-%d")
                    found = True
                    break

    if not found:
        return {"error": "Topic not found"}

    supabase.table("roadmaps").update({
        "weeks": roadmap["weeks"]
    }).eq("id", roadmap["id"]).execute()

    return {"success": True}

# Sub-routers
from app.modules.books.router import router as books_router
app.include_router(books_router)

from app.modules.Analytics.router import router as analytics_router
app.include_router(analytics_router)