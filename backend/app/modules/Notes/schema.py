from typing import Any, List
from pydantic import BaseModel


class GenerateTagsRequest(BaseModel):
    note_content: str
    subject: str


class SubjectTagsRequest(BaseModel):
    subject: str


class FetchURLRequest(BaseModel):
    url: str


class CreateNoteRequest(BaseModel):
    subject: str
    title: str
    content: str
    tags: List[str]
    urls: List[Any] = []


class UpdateNoteRequest(BaseModel):
    title: str
    content: str
    tags: List[str]
    urls: List[Any] = []