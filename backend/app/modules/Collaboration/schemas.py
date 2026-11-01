from pydantic import BaseModel, EmailStr, Field
from datetime import datetime
from typing import Literal, Optional
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

class WorkspaceNoteShare(BaseModel):
    note_id: UUID

class WorkspaceMessageCreate(BaseModel):
    content: str = Field(min_length=1, max_length=4000)

class WorkspaceMessageResponse(BaseModel):
    id: UUID
    workspace_id: UUID
    sender_id: UUID
    content: str
    created_at: datetime

class WorkspaceUpdateResponse(BaseModel):
    updates: list[dict] = Field(default_factory=list)
    has_more: bool = False

class CreatePollRequest(BaseModel):
    question: str = Field(..., min_length=1, max_length=300)
    options: list[str] = Field(..., min_length=2, max_length=10)
    description: Optional[str] = None
    resource_id: Optional[str] = None
    expires_at: Optional[datetime] = None

class CastPollVoteRequest(BaseModel):
    option_id: str

class PinPollRequest(BaseModel):
    is_pinned: bool

class PollResponse(BaseModel):
    success: bool
    message: Optional[str] = None
    data: Optional[dict] = None

class PollListResponse(BaseModel):
    polls: list[dict]

class PollDetailsResponse(BaseModel):
    poll: dict

class CreateWorkspaceTaskRequest(BaseModel):
    title: str = Field(..., min_length=1, max_length=150)
    description: Optional[str] = None
    due_date: Optional[datetime] = None


class WorkspaceTaskListResponse(BaseModel):
    tasks: list[dict]
    total: int

class UpdateWorkspaceTaskRequest(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=150)
    description: Optional[str] = None
    status: Optional[str] = None
    blocker_reason: Optional[str] = None
    due_date: Optional[datetime] = None

class CreateTaskCommentRequest(BaseModel):
    content: str = Field(..., min_length=1, max_length=2000)

class TaskCommentsResponse(BaseModel):
    comments: list[dict]
    total: int