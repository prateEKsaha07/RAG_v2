from contextlib import asynccontextmanager
from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.rag import rag, load_rag
load_dotenv()

@asynccontextmanager
async def lifespan(app: FastAPI):
    print("Starting server...")
    load_rag()
    yield
    print("Shutting down...")

app = FastAPI(lifespan=lifespan)

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


# Sub-routers
from app.modules.Quiz.router import router as quiz_router
app.include_router(quiz_router)

from app.modules.Qa.router import router as qa_router
app.include_router(qa_router)

from app.modules.Ingestion.router import router as ingestion_router
app.include_router(ingestion_router)

from app.modules.Notes.router import router as notes_router
app.include_router(notes_router)

from app.modules.Roadmap.router import router as roadmap_router
app.include_router(roadmap_router)

from app.modules.Subjects.router import router as subjects_router
app.include_router(subjects_router)

from app.modules.Uploads.router import router as uploads_router
app.include_router(uploads_router)

from app.modules.QuizHistory.router import router as quiz_history_router
app.include_router(quiz_history_router)

from app.modules.books.router import router as books_router
app.include_router(books_router)

from app.modules.Analytics.router import router as analytics_router
app.include_router(analytics_router)

from app.modules.profile.router import router as profile_router
app.include_router(profile_router)

from app.modules.Collaboration.router import router as collaboration_router
app.include_router(collaboration_router)
