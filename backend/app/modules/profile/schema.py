from pydantic import BaseModel
from uuid import UUID
from datetime import datetime

class profileResponse(BaseModel):
    id: UUID
    display_name: str
    username: str
    avatar_url: str | None 
    bio: str
    created_at: datetime
    updated_at: datetime 

class profileUpdate(BaseModel):
    display_name: str
    username: str
    avater_url: str | None
    bio: str

class Config:        
    from_attributes = True 
