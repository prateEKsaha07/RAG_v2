# app/main.py
import os
import json
import shutil
from contextlib import asynccontextmanager
from pathlib import Path
from typing import Any, List
from datetime import datetime

from dotenv import load_dotenv

from fastapi import FastAPI, UploadFile, File, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from app.core.auth import get_current_user
from app.core.rag import rag, load_rag, reload_vector_store
from app.core.text_utils import normalize_subject_key

load_dotenv()


@asynccontextmanager
async def lifespan(app: FastAPI):
    print("Starting server...")
    load_rag()
    yield
    print("Shutting down...")


app = FastAPI(lifespan=lifespan)

# Request models (still living in main.py — will move to modules later)

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
    return {
        "status": "ok",
        "ready": rag.vector_store_db is not None,
    }


# Unit-wise metadata endpoint
@app.get("/subjects/{subject}/units")
def get_subject_units(subject: str):
    if rag.vector_store_db is None:
        return {"error": "Vector store not ready"}

    needle = normalize_subject_key(subject)
    all_docs = list(rag.vector_store_db.docstore._dict.values())
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


# Subjects (uses Notes services for tag list)
@app.get("/subjects")
def get_subjects_endpoint():
    from app.modules.Notes.services import get_subjects
    return {"subjects": get_subjects()}


# Uploads
@app.get("/uploads/{subject}")
def get_upload_content(subject: str):
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

    if rag.vector_store_db is None:
        return {"error": "Vector store not ready. Please ingest documents first."}

    if check_existing_roadmap(request.subject, user_id=user.id):
        return {"error": "Active roadmap exists. Complete or delete it first."}

    result = generate_roadmap(
        subject=request.subject,
        hours_per_day=request.hours_per_day,
        target_date=request.target_date,
        scope=request.scope,
        unit_number=request.unit_number,
        llm=rag.llm,
        user_id=user.id,
        vectorStoreDB=rag.vector_store_db,
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
from app.modules.Quiz.router import router as quiz_router
app.include_router(quiz_router)

from app.modules.Qa.router import router as qa_router
app.include_router(qa_router)

from app.modules.Ingestion.router import router as ingestion_router
app.include_router(ingestion_router)

from app.modules.Notes.router import router as notes_router
app.include_router(notes_router)

from app.modules.books.router import router as books_router
app.include_router(books_router)

from app.modules.Analytics.router import router as analytics_router
app.include_router(analytics_router)

from app.modules.profile.router import router as profile_router
app.include_router(profile_router)