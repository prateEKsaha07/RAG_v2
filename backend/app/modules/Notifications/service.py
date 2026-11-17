import logging
from uuid import UUID
import uuid
from fastapi import APIRouter, Depends, HTTPException, logger
from pydantic import Field
from app.core.supabase_client import supabase

logger = logging.getLogger(__name__)


def _rpc_error(exc: Exception, fallback_message: str):
    message = str(exc)
    logger.error("RPC Error: %s", message)

    if "limit must be between" in message.lower():
        raise HTTPException(
            status_code=400,
            detail="Invalid limit value. Must be between 1 and 100."
        )

    raise HTTPException(status_code=500, detail=fallback_message)



def get_unread_count(user_id: UUID) -> int:
    try:
        response = supabase.rpc("notification_unread_count", {"p_user_id": str(user_id)}).execute()
        return int(response.data or 0)    
    except HTTPException:
            raise
    except Exception as e:
        _rpc_error(e, "Failed to retrieve unread notification count.")

def list_notifications(user_id:UUID,
                        limit:int =20,
                        before:str | None = None):
    try:
        response = supabase.rpc("list_notifications", {
            "p_user_id": str(user_id),
            "p_limit": limit,
            "p_before": before
        }).execute()
        return response.data or []
    except HTTPException:
            raise
    except Exception as e:
        _rpc_error(e, "Failed to list notifications.")

def mark_read(user_id:UUID,
              notification_ids:list[UUID]) -> int:
    try:
        response = supabase.rpc("notifications_read", {
            "p_user_id": str(user_id),
            "p_notification_ids": [str(nid) for nid in notification_ids]
        }).execute()
        return response.data or []
    except HTTPException:
            raise
    except Exception as e:
        _rpc_error(e, "Failed to mark notifications as read.")


def create_notification(
            user_id :UUID,
            source : str,
            notification_type : str,
            payload : dict,
            entity_id : str | None = None,
            entity_type : str | None = None,
            workspace_id : str | None = None
)->dict:
    try:
        repsonse = supabase.table("notifications").insert({
            "user_id": str(user_id),
            "source": source,
            "notification_type": notification_type,
            "payload": payload or {},
            "entity_id": entity_id,
            "entity_type": entity_type,
            "workspace_id": workspace_id
         }).execute()

        if not repsonse.data:
            raise HTTPException(status_code=500, detail="Failed to create notification.")
        
        return repsonse.data[0] if repsonse.data else {}
        
    except HTTPException:
            raise
    except Exception as e:
        _rpc_error(e, "Failed to create notification.")








