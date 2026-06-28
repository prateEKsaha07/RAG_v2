from datetime import datetime
import json
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
from supabase_client import supabase

from roadmap import (
    generate_roadmap,
    load_roadmap,
    check_existing_roadmap
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
    subject: str 

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
    print("Received:", request.subject)
    
    results, weak_topics = evaluate_answers(request.quiz, request.answers, request.subject.strip())
    recommendations = get_recommendations(weak_topics, vectorStoreDB)
    return {
        "results": results,
        "weak_topics": weak_topics,
        "recommendations": recommendations
    }

@app.get("/quiz-history")
def get_quiz_history(subject: str = None):
    history_file = "analytics/quiz_history.json"
    
    if not os.path.exists(history_file):
        return {"history": []}
    
    with open(history_file, "r") as f:
        history = json.load(f)
    
    if subject:
        history = [h for h in history 
                  if h["subject"].lower() == subject.lower()]
    
    return {"history": history}


@app.post("/ingest")
def ingestion(file: UploadFile = File(...)):
    file_path = f"data/uploads/{file.filename}"
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

@app.get("/uploads/{subject}")
def get_upload_content(subject: str):
    import glob
    # Find file matching subject name
    files = glob.glob(f"data/uploads/{subject}*")
    if not files:
        return {"error": "No upload found for this subject"}
    
    with open(files[0], "r", encoding="utf-8") as f:
        return {"content": f.read()}


# roadmap endpoints
class RoadmapRequest(BaseModel):
    subject: str
    hours_per_day: int
    target_date: str
    scope: str
    unit_number: int = None

class ExtendDateRequest(BaseModel):
    new_target_date: str

class CompleteTopicRequest(BaseModel):
    week: int
    topic_name: str


@app.post("/roadmap")
def generate_roadmap_endpoint(request: RoadmapRequest):
    # Check if active roadmap exists
    if check_existing_roadmap(request.subject):
        return {"error": "Active roadmap exists. Complete or delete it first."}
    
    result = generate_roadmap(
        subject=request.subject,
        hours_per_day=request.hours_per_day,
        target_date=request.target_date,
        scope=request.scope,
        unit_number=request.unit_number,
        llm=llm
    )
    return result

@app.get("/roadmap/{subject}")
def get_roadmap_endpoint(subject: str):
    roadmap = load_roadmap(subject)
    if not roadmap:
        return {"error": "No roadmap found"}
    return roadmap

@app.delete("/roadmap/{subject}")
def delete_roadmap_endpoint(subject: str):
    filepath = f"analytics/roadmaps/roadmap_{subject}.json"
    if not os.path.exists(filepath):
        return {"error": "No roadmap found"}
    os.remove(filepath)
    return {"success": True, "message": f"Roadmap for {subject} deleted"}

@app.put("/roadmap/{subject}/extend")
def extend_roadmap_endpoint(subject: str, request: ExtendDateRequest):
    roadmap = load_roadmap(subject)
    if not roadmap:
        return {"error": "No roadmap found"}
    
    roadmap["target_date"] = request.new_target_date
    
    from roadmap import save_roadmap
    save_roadmap(subject, roadmap)
    return {"success": True, "new_target_date": request.new_target_date}

@app.put("/roadmap/{subject}/complete-topic")
def complete_topic_endpoint(subject: str, request: CompleteTopicRequest):
    roadmap = load_roadmap(subject)
    if not roadmap:
        return {"error": "No roadmap found"}
    
    # Find and update topic status
    for week in roadmap["weeks"]:
        if week["week"] == request.week:
            for item in week["topics"]:
                if item["topic"]["name"] == request.topic_name:
                    item["topic"]["status"] = "completed"
                    item["topic"]["completed_date"] = datetime.now().strftime("%Y-%m-%d")
                    break
    
    from roadmap import save_roadmap
    save_roadmap(subject, roadmap)
    return {"success": True}

# analytics endpoints
@app.get("/analytics/{subject}")
def get_analytics(subject:str):

    history_file = "analytics/quiz_history.json"
        
    if not os.path.exists(history_file):
        return {"error": "No analytics data found"}
    with open(history_file,"r") as f:
        history = json.load(f)
        print("Analytics history length:", len(history))

    subject_history = [h for h in history
                       if h["subject"].lower() == subject.lower()]
    if not subject_history:
        return {"error": f"No analytics data found for{subject}"}
    
    # score progression over time
    score_progression = [
        {
            "date": h["date"],
            "percentage": round((h["score"]/h["total"])*100)
        }
        for h in subject_history
    ]

    # weak topics frequency
    topic_count = {}
    for h in subject_history:
        for topic in h["weak_topics"]:
            topic_count[topic] = topic_count.get(topic, 0) + 1

    # pass fail ratio
    passes = sum(1 for h in subject_history if h["score"] >= 3)
    fails = len(subject_history) - passes

    # score distribution
    distribution = {"0-1": 0, "2-3": 0, "4-5": 0}
    for h in subject_history:
        if h["score"] <= 1:
            distribution["0-1"] += 1
        elif h["score"] <= 3:
            distribution["2-3"] += 1
        else:
            distribution["4-5"] += 1

    # summary
    # Summary
    avg_score = round(sum(h["score"] for h in subject_history) / len(subject_history), 1)
    best_score = max(h["score"] for h in subject_history)
    total_attempts = len(subject_history)

    return {
    "subject": subject,
    "summary": {
        "total_attempts": total_attempts,
        "average_score": avg_score,
        "best_score": best_score,
        "total": subject_history[0]["total"]
    },
    "score_progression": score_progression,
    "weak_topics_chart": [
        {"topic": t, "count": c} 
        for t, c in sorted(topic_count.items(), key=lambda x: x[1], reverse=True)
    ],
    "pass_fail": [
        {"name": "Pass", "value": passes},
        {"name": "Fail", "value": fails}
    ],
    "score_distribution": [
        {"range": k, "count": v} 
        for k, v in distribution.items()
    ],
    "attempts_table": subject_history
}


# print(supabase.table("notes").select("*").execute())