from pydantic import BaseModel, EmailStr, Field

class WorkspaceCreate(BaseModel):
    name: str = Field(min_length=1, max_length=100)
    description: str = Field(default="", max_length=2000)

class WorkspaceInvite(BaseModel):
    email: EmailStr
