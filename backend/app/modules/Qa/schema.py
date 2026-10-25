from typing import Optional
from pydantic import BaseModel

class AskRequest(BaseModel):
    question: str
    subject: Optional[str] = None
    general_knowledge: bool = False