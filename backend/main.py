from fastapi import FastAPI, UploadFile, File
from quiz import generate_quiz, evaluate_answers, get_recommendations
from pydantic import BaseModel
from ingestion import run_ingestion
from fastapi.middleware.cors import CORSMiddleware
import shutil

app = FastAPI()

class QuizRequest(BaseModel):
    subject: str

class EvaluateRequest(BaseModel):
    quiz: list
    answers: list

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
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
def evaluate( request: EvaluateRequest):
    results, weak_topics = evaluate_answers(request.quiz, request.answers)
    recommendations = get_recommendations(weak_topics)
    return {
        "results": results,
        "weak_topics": weak_topics,
        "recommendations": recommendations
    }
@app.post("/ingestion")
def ingestion(file: UploadFile = File(...)):
    file_path = f"data/{file.filename}"
    with open(file_path,"wb") as f:
        shutil.copyfileobj(file.file,f)
    
    chunk_count = run_ingestion()
    
    return {
        "message": f"{file.filename} ingested successfully",
        "chunks_created": chunk_count
    }