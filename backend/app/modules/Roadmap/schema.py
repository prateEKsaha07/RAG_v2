from typing import Optional
from pydantic import BaseModel


class RoadmapRequest(BaseModel):
    subject: str
    hours_per_day: int
    target_date: str
    scope: str
    unit_number: Optional[int] = None


class ExtendDateRequest(BaseModel):
    new_target_date: str


class CompleteTopicRequest(BaseModel):
    week: int
    topic_name: str