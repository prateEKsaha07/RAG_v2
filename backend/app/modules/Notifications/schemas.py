from pydantic import BaseModel, Field
import uuid
from typing import Literal, Optional
from datetime import datetime

NotificationSource = Literal["system", "friends", "collaboration"]

class NotificationResponse(BaseModel):
    id : uuid.UUID = Field(..., description="Unique identifier for the notification")
    user_id : uuid.UUID = Field(..., description="Unique identifier for the user")
    source : NotificationSource
    type : str
    workspace_id : Optional[uuid.UUID] = None 
    entity_id : Optional[str] = None 
    entity_type : Optional[str] = None
    payload : dict = Field(default_factory=dict, description="Payload of the notification")
    read_at : Optional[datetime] = None
    created_at : datetime

class UnreadNotificationResponse(BaseModel):
    unread_count : int = Field(..., description="Count of unread notifications")

class MarkReadRequest(BaseModel):
    notification_ids : list[uuid.UUID] = Field(..., description="List of notification IDs to mark as read")