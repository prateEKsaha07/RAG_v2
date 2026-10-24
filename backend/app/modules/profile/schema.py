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
    display_name: str | None = None
    username: str | None =  None
    avater_url: str | None = None
    bio: str | None = None

class Config:        
    from_attributes = True 
