from fastapi import FastAPI, UploadFile, File
from quiz import generate_quiz, evaluate_answers, get_recommendations
from pydantic import BaseModel
from ingestion import run_ingestion
from fastapi.middleware.cors import CORSMiddleware
import shutil
from typing import List, Dict, Any

app = FastAPI()

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
    quiz = generate_quiz(request.subject)
    return {"quiz": quiz}

@app.post("/evaluate")
async def evaluate_endpoint(request: EvaluateRequest):
    print("Received quiz length:", len(request.quiz))
    print("Received answers:", request.answers)
    print("Quiz item 0:", request.quiz[0] if request.quiz else "empty")
    
    results, weak_topics = evaluate_answers(request.quiz, request.answers)
    recommendations = get_recommendations(weak_topics)
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
    
    return {
        "message": f"{file.filename} ingested successfully",
        "chunks_created": chunk_count
    }