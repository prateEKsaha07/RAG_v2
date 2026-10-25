import json
import os
from fastapi import APIRouter
from app.core.text_utils import normalize_subject_key
router = APIRouter(tags=["quiz-history"])

@router.get("/quiz-history")
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