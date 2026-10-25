from typing import Any, List, Optional
from pydantic import BaseModel

class QuizRequest(BaseModel):
    subject: str
    unit_number: Optional[int] = None

class EvaluateRequest(BaseModel):
    quiz: List[Any]
    answers: List[Any]
    subject: str