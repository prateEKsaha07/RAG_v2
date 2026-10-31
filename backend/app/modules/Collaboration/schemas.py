from pydantic import BaseModel, EmailStr, Field
from datetime import datetime
from typing import Literal
from uuid import UUID
from pydantic import BaseModel


class WorkspaceCreate(BaseModel):
    name: str = Field(min_length=1, max_length=100)
    description: str = Field(default="", max_length=2000)

class WorkspaceInvite(BaseModel):
    email: EmailStr

class WorkspaceMemberResponse(BaseModel):
    user_id: UUID
    role: Literal["owner", "admin", "member"]
    joined_at: datetime
    display_name: str | None = None
    username: str | None = None
    avatar_url: str | None = None

class WorkspaceRoleUpdate(BaseModel):
    role: Literal["admin", "member"]