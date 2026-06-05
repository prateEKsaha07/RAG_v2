import os
from dotenv import load_dotenv
from fastapi import FastAPI, UploadFile, File
from quiz import generate_quiz, evaluate_answers, get_recommendations
from pydantic import BaseModel
from ingestion import run_ingestion
from fastapi.middleware.cors import CORSMiddleware
import shutil
from typing import List, Dict, Any
from langchain_cohere import CohereEmbeddings, ChatCohere
from langchain_community.vectorstores import FAISS
from query import get_answer
from notes import (
    create_note,
    get_all_notes,
    get_note_content,
    update_note,
    delete_note,
    get_subjects,
    generate_tags,
    fetch_url_title
)

load_dotenv()
app = FastAPI()

print("Starting server...")
print("API Key exists:", bool(os.getenv("COHERE_API_KEY")))

embeddings = CohereEmbeddings(
    model="embed-english-light-v3.0",
    cohere_api_key=os.getenv("COHERE_API_KEY")
)

vectorStoreDB =FAISS.load_local("faiss_index",embeddings,allow_dangerous_deserialization=True)

llm = ChatCohere(
    model="command-r7b-12-2024",
    cohere_api_key=os.getenv("COHERE_API_KEY")
)

class QuizRequest(BaseModel):
    subject: str

class EvaluateRequest(BaseModel):
    quiz: list[Any]
    answers: list[Any]

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def home():
    return {"message": "Server Online"}

@app.post("/generate-quiz")
def generateQuiz( request: QuizRequest):
    quiz = generate_quiz(request.subject, llm, vectorStoreDB)
    return {"quiz": quiz}

@app.post("/evaluate")
async def evaluate_endpoint(request: EvaluateRequest):
    print("Received quiz length:", len(request.quiz))
    print("Received answers:", request.answers)
    print("Quiz item 0:", request.quiz[0] if request.quiz else "empty")
    
    results, weak_topics = evaluate_answers(request.quiz, request.answers)
    recommendations = get_recommendations(weak_topics, vectorStoreDB)
    return {
        "results": results,
        "weak_topics": weak_topics,
        "recommendations": recommendations
    }

@app.post("/ingest")
def ingestion(file: UploadFile = File(...)):
    file_path = f"data/{file.filename}"
    with open(file_path,"wb") as f:
        shutil.copyfileobj(file.file,f)
    
    chunk_count = run_ingestion()
    # Reload FAISS with new data
    global vectorStoreDB
    vectorStoreDB = FAISS.load_local(
        "faiss_index", embeddings,
        allow_dangerous_deserialization=True
    )
    return {
        "message": f"{file.filename} ingested successfully",
        "chunks_created": chunk_count
    }

class AskRequest(BaseModel):
    question: str

@app.post("/ask")
def ask_endpoint(request: AskRequest):
    response = get_answer(request.question, llm, vectorStoreDB)
    return response

# Notes endpoints


# specific first
class GenerateTagsRequest(BaseModel):
    note_content: str
    subject: str
@app.post("/notes/generate-tags")
def generate_tags_endpoint(request: GenerateTagsRequest):
    tags = generate_tags(request.note_content, request.subject, llm)
    return {"tags": tags}

class FetchURLRequest(BaseModel):
    url: str
@app.post("/notes/fetch-url")
def fetch_url_endpoint(request: FetchURLRequest):
    return {"title": fetch_url_title(request.url)}

@app.post("/notes/ingest")
def ingest_notes_endpoint():
    from notes import ingest_notes
    result = ingest_notes(embeddings)
    
    # Reload notes FAISS after ingestion
    global notes_db
    notes_db = FAISS.load_local(
        "notes_faiss_index", embeddings,
        allow_dangerous_deserialization=True
    )
    return result

# then general

@app.get("/notes/{filename}")
def get_note_content_endpoint(filename: str):
    return get_note_content(filename)

class UpdateNoteRequest(BaseModel):
    title: str
    content: str
    tags: List[str]
    urls: List[Any] = []
@app.put("/notes/{filename}")
def update_note_endpoint(filename: str, request: UpdateNoteRequest):
    return update_note(
        filename=filename,
        title=request.title,
        content=request.content,
        tags=request.tags,
        urls=request.urls
    )

@app.delete("/notes/{filename}")
def delete_note_endpoint(filename: str):
    return delete_note(filename)


class CreateNoteRequest(BaseModel):
    subject: str
    title: str
    content: str
    tags: List[str]
    urls: List[Any] = []
@app.post("/notes")
def create_note_endpoint(request: CreateNoteRequest):
    result = create_note(
        subject=request.subject,
        title=request.title,
        content=request.content,
        tags=request.tags,
        urls=request.urls
    )
    return result

@app.get("/notes")
def get_notes_endpoint(subject: str = None, tags: str = None):
    tag_list = tags.split(",") if tags else None
    return {"notes": get_all_notes(subject, tag_list)}

@app.get("/subjects")
def get_subjects_endpoint():
    return {"subjects": get_subjects()}




