from datetime import datetime

from fastapi import APIRouter, Depends, Query

from app.core.auth import get_current_user
from app.modules.Notifications.schemas import (
    MarkReadRequest,
    NotificationResponse,
    UnreadNotificationResponse,
)
from app.modules.Notifications.service import (
    get_unread_count,
    list_notifications,
    mark_read,
)

router = APIRouter(
    prefix="/notifications",
    tags=["Notifications"],
)


@router.get(
    "/unread_count",
    response_model=UnreadNotificationResponse,
    summary="Get unread notification count",
)
async def get_unread_count_endpoint(current_user=Depends(get_current_user)):
    unread_count = get_unread_count(current_user.id)
    return UnreadNotificationResponse(unread_count=unread_count)


@router.get(
    "",
    response_model=list[NotificationResponse],
    summary="List notifications",
)
async def list_notifications_endpoint(
    current_user=Depends(get_current_user),
    limit: int = Query(default=20, ge=1, le=100),
    before: datetime | None = None,
):
    notifications = list_notifications(
        user_id=current_user.id,
        limit=limit,
        before=before.isoformat() if before else None,
    )
    return notifications


@router.post("/mark_as_read", response_model=dict)
def mark_as_read_endpoint(
    payload: MarkReadRequest,
    current_user=Depends(get_current_user),
):
    response = mark_read(
        user_id=current_user.id,
        notification_ids=payload.notification_ids,
    )
    return {"updated": response}