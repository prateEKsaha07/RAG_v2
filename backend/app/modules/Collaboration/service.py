from fastapi import HTTPException, logger
import re
import logging
from pymupdf import message
from app.core.supabase_client import supabase
from app.modules.Collaboration.schemas import (
    WorkspaceCreate,
    WorkspaceInvite,
)
logger = logging.getLogger(__name__)

def _rpc_error(exc: Exception):
    """this will map a supabase rpc exception to a more appropriate HTTPException"""
    message = str(exc)

    extracted = None
    for attr in ("message", "detail"):
        value = getattr(exc, attr, None)
        if isinstance(value, str) and value:
            extracted = value
            break

    if extracted is None:
        match = re.search(
            r"""['"]message['"]\s*[:=]\s*['"](.+?)['"]""", # matches this {'message': 'whatever error'}
            message,
            re.S,
        )
        extracted = match.group(1) if match else message

    lowered = extracted.lower()
    logger.warning("RPC error: %s", extracted)
    
    # already closed errors -> comes under 400
    # if "already closed" in lowered:
    #     raise HTTPException(status_code=400,detail="The resource is already closed.")

    # workspace membership errors -> comes under 403
    if "workspace membership not found" in lowered:
        raise HTTPException(status_code=403, detail="You are not a member of this workspace.")
    
    # authorization errors -> comes under 403
    if any(term in lowered for term in (
        "not authorized",
        "not the task owner",
        "only the task owner",
        "permission denied",
        "not a workspace member", # this one is new add 11/8/2026
        "not a member of this workspace",
        "only workspace owners and admins", # this one too
    )):
        raise HTTPException(status_code=403,detail="You are not allowed to perform this action.")

    # shared resource lookup errors -> comes under 400
    if "shared resource not found" in lowered:
        raise HTTPException(status_code=400,detail="Shared resource not found or no longer available.")

    # now not found errors -> comes under 404
    if any(term in lowered for term in (
        "not found",
        "no registered user found")):
        raise HTTPException(status_code=404,detail=extracted)

    # validation errors -> comes under 400 added more terms to catch more validation errors
    if any(term in lowered for term in (
        "invalid invitation action",
        "poll is closed",
        "poll has expired",
        "no longer accepts votes",
        "option does not belong to poll",
        "invalid poll option",                
        "invalid poll options",
        "a poll must have",               
        "each option must",                    
        "question must",
        "options must",
        "expiration must be",                  
        "poll expiration",
        "title must",
        "invalid task status",
        "blocker reason",
        "content must",
        "email is required",                   
        "workspace name must",                 
        "workspace description is too long",   
        "limit must be between",               
        "invalid message limit",
    )):
        raise HTTPException(status_code=400,detail=extracted)

    # conflict errors -> comes under 409
    if any(term in lowered for term in (
        "already exists",
        "already a workspace member",
        "cannot invite yourself",
        "pending invitation already exists",
        "invitation is no longer pending",
        "already pinned",
        "duplicate key violates",       # Postgres unique violation
        "violates unique constraint",
        "already closed",
    )):
        raise HTTPException(status_code=409,detail="This action conflicts with the current state of the workspace.")

    # fallback to 500 for any other unhandled errors
    raise HTTPException(status_code=500,detail="Collaboration operation failed.")

def create_workspace(payload: WorkspaceCreate, user_id: str):
    try:
        response = supabase.rpc(
            "create_workspace_with_owner",
            {
                "p_name": payload.name,
                "p_description": payload.description,
                "p_owner_id": user_id,
            },
        ).execute()
        if not response.data:
            raise HTTPException(status_code=500, detail="Workspace creation returned no data.")
        return response.data
    except HTTPException:
        raise
    except Exception as exc:
        _rpc_error(exc)

def list_workspaces(user_id: str):
    try:
        memberships = (
            supabase.table("workspace_members")
            .select("workspace_id, role")
            .eq("user_id", user_id)
            .execute()
        )

        if not memberships.data:
            return []

        workspace_ids = [row["workspace_id"] for row in memberships.data]
        workspaces = (
            supabase.table("workspaces")
            .select("*")
            .in_("id", workspace_ids)
            .execute()
        )

        roles = {row["workspace_id"]: row["role"] for row in memberships.data}
        return [
            {**workspace, "current_user_role": roles.get(workspace["id"])}
            for workspace in (workspaces.data or [])
        ]
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(status_code=500, detail="Unable to retrieve workspaces.")

def create_invitation(
    workspace_id: str,
    payload: WorkspaceInvite,
    inviter_id: str,
):
    try:
        response = supabase.rpc(
            "invite_registered_user",
            {
                "p_workspace_id": workspace_id,
                "p_invited_email": str(payload.email),
                "p_inviter_id": inviter_id,
            },
        ).execute()
        return response.data
    except Exception as exc:
        _rpc_error(exc)

def list_invitations(user_id: str, user_email: str | None):
    try:
        sent = (
            supabase.table("workspace_invitations")
            .select("*")
            .eq("invited_by", user_id)
            .execute()
        )

        received_query = (
            supabase.table("workspace_invitations")
            .select("*")
            .eq("invited_user_id", user_id)
        )
        received = received_query.execute()

        invitations = {
            row["id"]: row for row in (sent.data or [])
        }
        invitations.update({
            row["id"]: row for row in (received.data or [])
        })

        return sorted(
            invitations.values(),
            key=lambda row: row.get("created_at", ""),
            reverse=True,
        )
    except Exception:
        raise HTTPException(status_code=500, detail="Unable to retrieve invitations.")

def respond_to_invitation(
    invitation_id: str,
    user_id: str,
    action: str,
):
    try:
        response = supabase.rpc(
            "respond_to_workspace_invitation",
            {
                "p_invitation_id": invitation_id,
                "p_actor_id": user_id,
                "p_action": action,
            },
        ).execute()
        return response.data
    except Exception as exc:
        _rpc_error(exc)

def list_workspace_members(workspace_id: str, user_id: str):
    try:
        # Retrieve workspace membership records
        response = (
            supabase.table("workspace_members")
            .select("user_id, role, joined_at")
            .eq("workspace_id", workspace_id)
            .order("joined_at")
            .execute()
        )

        members = response.data or []

        # Verify that the requesting user belongs to this workspace
        if not any(member["user_id"] == user_id for member in members):
            raise HTTPException(
                status_code=403,
                detail="You are not a member of this workspace.",
            )

        if not members:
            return []

        # Retrieve profile information for all members
        user_ids = [member["user_id"] for member in members]

        profiles_response = (
            supabase.table("profiles")
            .select("id, display_name, username, avatar_url")
            .in_("id", user_ids)
            .execute()
        )

        profiles = {
            profile["id"]: profile
            for profile in (profiles_response.data or [])
        }

        # Combine membership and profile information
        result = []

        for member in members:
            profile = profiles.get(member["user_id"], {})

            result.append({
                "user_id": member["user_id"],
                "role": member["role"],
                "joined_at": member["joined_at"],
                "display_name": profile.get("display_name"),
                "username": profile.get("username"),
                "avatar_url": profile.get("avatar_url"),
            })

        return result

    except HTTPException:
        raise

    except Exception:
        raise HTTPException(
            status_code=500,
            detail="Unable to retrieve workspace members.",
        )

def update_workspace_member_role(
    workspace_id: str,
    target_user_id: str,
    actor_id: str,
    new_role: str,
):
    try:
        response = supabase.rpc(
            "update_workspace_member_role",
            {
                "p_workspace_id": workspace_id,
                "p_target_user_id": target_user_id,
                "p_actor_id": actor_id,
                "p_new_role": new_role,
            },
        ).execute()

        if not response.data:
            raise HTTPException(
                status_code=500,
                detail="Role update returned no data.",
            )

        return response.data

    except HTTPException:
        raise

    except Exception as exc:
        message = str(exc).lower()

        if "not authorized" in message:
            raise HTTPException(
                status_code=403,
                detail="Only the workspace owner can change member roles.",
            )

        if "not found" in message:
            raise HTTPException(
                status_code=404,
                detail=str(exc),
            )

        if "owner role cannot be changed" in message:
            raise HTTPException(
                status_code=400,
                detail="The workspace owner's role cannot be changed.",
            )

        if "invalid role" in message:
            raise HTTPException(
                status_code=400,
                detail="Invalid workspace role.",
            )

        raise HTTPException(
            status_code=500,
            detail="Unable to update workspace member role.",
        )

def remove_workspace_member(
    workspace_id: str,
    target_user_id: str,
    actor_id: str,
):
    try:
        response = supabase.rpc(
            "remove_workspace_member",
            {
                "p_workspace_id": workspace_id,
                "p_target_user_id": target_user_id,
                "p_actor_id": actor_id,
            },
        ).execute()

        if not response.data:
            raise HTTPException(
                status_code=500,
                detail="Member removal returned no data.",
            )

        return response.data

    except HTTPException:
        raise

    except Exception as exc:
        message = str(exc).lower()

        if "not authorized" in message:
            raise HTTPException(
                status_code=403,
                detail="You are not allowed to remove this member.",
            )

        if "not a workspace member" in message:
            raise HTTPException(
                status_code=403,
                detail="You are not a member of this workspace.",
            )

        if "not found" in message:
            raise HTTPException(
                status_code=404,
                detail="Workspace member not found.",
            )

        if "owner cannot be removed" in message:
            raise HTTPException(
                status_code=400,
                detail="The workspace owner cannot be removed.",
            )

        if "cannot remove other admins" in message:
            raise HTTPException(
                status_code=403,
                detail="Admins cannot remove other admins.",
            )

        raise HTTPException(
            status_code=500,
            detail="Unable to remove workspace member.",
        )

def share_workspace_note(
    workspace_id: str,
    note_id: str,
    actor_id: str,
):
    try:
        response = supabase.rpc(
            "share_workspace_note",
            {
                "p_workspace_id": workspace_id,
                "p_note_id": note_id,
                "p_actor_id": actor_id,
            },
        ).execute()

        if not response.data:
            raise HTTPException(
                status_code=500,
                detail="Note sharing returned no data.",
            )

        return response.data

    except HTTPException:
        raise

    except Exception as exc:
        message = str(exc).lower()

        if "not a workspace member" in message:
            raise HTTPException(
                status_code=403,
                detail="You are not a member of this workspace.",
            )

        if "note not found or not owned" in message:
            raise HTTPException(
                status_code=404,
                detail="Note not found or you do not own this note.",
            )

        if "already shared" in message:
            raise HTTPException(
                status_code=409,
                detail="This note is already shared with the workspace.",
            )

        raise HTTPException(
            status_code=500,
            detail="Unable to share note.",
        )

def list_workspace_resources(workspace_id: str, user_id: str):
    try:
        # Verify workspace membership
        membership = (
            supabase.table("workspace_members")
            .select("role")
            .eq("workspace_id", workspace_id)
            .eq("user_id", user_id)
            .execute()
        )

        if not membership.data:
            raise HTTPException(
                status_code=403,
                detail="You are not a member of this workspace.",
            )

        # Retrieve active shared resources
        response = (
            supabase.table("workspace_resources")
            .select("*")
            .eq("workspace_id", workspace_id)
            .is_("revoked_at", "null")
            .order("created_at", desc=True)
            .execute()
        )

        resources = response.data or []

        # Verify that referenced notes still exist
        note_ids = [
            resource["resource_id"]
            for resource in resources
            if resource["resource_type"] == "note"
        ]

        if not note_ids:
            return resources

        notes_response = (
            supabase.table("notes")
            .select("id")
            .in_("id", note_ids)
            .execute()
        )

        existing_note_ids = {
            str(note["id"])
            for note in (notes_response.data or [])
        }

        return [
            resource
            for resource in resources
            if resource["resource_type"] != "note"
            or resource["resource_id"] in existing_note_ids
        ]

    except HTTPException:
        raise

    except Exception:
        raise HTTPException(
            status_code=500,
            detail="Unable to retrieve workspace resources.",
        )

def revoke_workspace_resource(
    workspace_id: str,
    resource_id: str,
    actor_id: str,
):
    try:
        response = supabase.rpc(
            "revoke_workspace_resource",
            {
                "p_workspace_id": workspace_id,
                "p_resource_id": resource_id,
                "p_actor_id": actor_id,
            },
        ).execute()

        if not response.data:
            raise HTTPException(
                status_code=500,
                detail="Resource revocation returned no data.",
            )

        return response.data

    except HTTPException:
        raise

    except Exception as exc:
        message = str(exc).lower()

        if "not a workspace member" in message:
            raise HTTPException(
                status_code=403,
                detail="You are not a member of this workspace.",
            )

        if "not found" in message:
            raise HTTPException(
                status_code=404,
                detail="Active workspace resource not found.",
            )

        if "not authorized" in message:
            raise HTTPException(
                status_code=403,
                detail="You are not allowed to revoke this resource.",
            )

        raise HTTPException(
            status_code=500,
            detail="Unable to revoke workspace resource.",
        )

def send_workspace_message(
    workspace_id: str,
    sender_id: str,
    content: str,
):
    try:
        response = supabase.rpc(
            "send_workspace_message",
            {
                "p_workspace_id": workspace_id,
                "p_sender_id": sender_id,
                "p_content": content,
            },
        ).execute()

        if not response.data:
            raise HTTPException(
                status_code=500,
                detail="Message sending returned no data.",
            )

        return response.data

    except HTTPException:
        raise

    except Exception as exc:
        message = str(exc).lower()

        if "not a workspace member" in message:
            raise HTTPException(
                status_code=403,
                detail="You are not a member of this workspace.",
            )

        if "message must contain" in message:
            raise HTTPException(
                status_code=400,
                detail="Message must contain between 1 and 4000 characters.",
            )

        raise HTTPException(
            status_code=500,
            detail="Unable to send workspace message.",
        )

def get_workspace_messages(
    workspace_id: str,
    user_id: str,
    limit: int = 50,
    before: str | None = None,
):
    try:
        response = supabase.rpc(
            "get_workspace_messages",
            {
                "p_workspace_id": workspace_id,
                "p_user_id": user_id,
                "p_limit": limit,
                "p_before": before,
            },
        ).execute()

        return response.data or []

    except Exception as exc:
        message = str(exc).lower()

        if "not a workspace member" in message:
            raise HTTPException(
                status_code=403,
                detail="You are not a member of this workspace.",
            )

        if "invalid message limit" in message:
            raise HTTPException(
                status_code=400,
                detail="Message limit must be between 1 and 100.",
            )

        raise HTTPException(
            status_code=500,
            detail="Unable to retrieve workspace messages.",
        )

def get_workspace_updates(
    workspace_id: str,
    user_id: str,
    limit: int = 50,
    after: str | None = None
):
    try:
        response = supabase.rpc(
            "get_workspace_updates",
            {
                "p_workspace_id": workspace_id,
                "p_user_id": user_id,
                "p_limit": limit,
                "p_after": after
            }
        ).execute()

        return response.data

    except Exception as e:
        _rpc_error(e)

def create_workspace_poll(
    workspace_id: str,
    user_id: str,
    payload
):
    try:
        response = supabase.rpc(
            "create_workspace_poll",
            {
                "p_workspace_id": workspace_id,
                "p_user_id": user_id,
                "p_question": payload.question,
                "p_options": payload.options,
                "p_description": payload.description,
                "p_resource_id": payload.resource_id,
                "p_expires_at": (
                    payload.expires_at.isoformat()
                    if payload.expires_at else None
                ),
            },
        ).execute()

        if not response.data:
            raise HTTPException(
                status_code=500,
                detail="Poll creation returned no data."
            )

        return response.data

    except HTTPException:
        raise

    except Exception as exc:
        _rpc_error(exc)

def list_workspace_polls(
    workspace_id: str,
    user_id: str
):
    try:
        response = supabase.rpc(
            "get_workspace_polls",
            {
                "p_workspace_id": workspace_id,
                "p_user_id": user_id,
            },
        ).execute()

        return response.data or []

    except Exception as exc:
        _rpc_error(exc)

def get_workspace_poll_details(
    poll_id: str,
    user_id: str
):
    try:
        response = supabase.rpc(
            "get_workspace_poll_details",
            {
                "p_poll_id": poll_id,
                "p_user_id": user_id,
            },
        ).execute()

        if not response.data:
            raise HTTPException(
                status_code=404,
                detail="Poll not found."
            )

        return response.data

    except HTTPException:
        raise

    except Exception as exc:
        _rpc_error(exc)

def cast_workspace_poll_vote(
    poll_id: str,
    option_id: str,
    user_id: str
):
    try:
        response = supabase.rpc(
            "cast_workspace_poll_vote",
            {
                "p_poll_id": poll_id,
                "p_option_id": option_id,
                "p_user_id": user_id,
            },
        ).execute()

        if not response.data:
            raise HTTPException(
                status_code=500,
                detail="Vote submission returned no data."
            )

        return response.data

    except HTTPException:
        raise

    except Exception as exc:
        _rpc_error(exc)

def close_workspace_poll(
    poll_id: str,
    user_id: str
):
    try:
        response = supabase.rpc(
            "close_workspace_poll",
            {
                "p_poll_id": poll_id,
                "p_user_id": user_id,
            },
        ).execute()

        return response.data

    except Exception as exc:
        _rpc_error(exc)

def set_workspace_poll_pin(
    poll_id: str,
    user_id: str,
    is_pinned: bool
):
    try:
        response = supabase.rpc(
            "set_workspace_poll_pin",
            {
                "p_poll_id": poll_id,
                "p_user_id": user_id,
                "p_is_pinned": is_pinned,
            },
        ).execute()

        return response.data

    except Exception as exc:
        _rpc_error(exc)

def create_workspace_task(workspace_id: str, user_id: str, payload):
    try:
        response = supabase.rpc(
            "create_workspace_task",
            {
                "p_workspace_id": workspace_id,
                "p_user_id": user_id,
                "p_title": payload.title,
                "p_description": payload.description,
                "p_due_date": (
                    payload.due_date.isoformat()
                    if payload.due_date else None
                ),
            },
        ).execute()

        if not response.data:
            raise HTTPException(
                status_code=500,
                detail="Task creation returned no data."
            )

        return response.data

    except HTTPException:
        raise
    except Exception as exc:
        _rpc_error(exc)

def list_workspace_tasks(workspace_id: str, user_id: str):
    try:
        response = supabase.rpc(
            "get_workspace_tasks",
            {
                "p_workspace_id": workspace_id,
                "p_user_id": user_id,
            },
        ).execute()

        return response.data or {"tasks": [], "total": 0}

    except Exception as exc:
        _rpc_error(exc)

def update_workspace_task(
    task_id: str,
    user_id: str,
    payload
):
    try:
        response = supabase.rpc(
            "update_workspace_task",
            {
                "p_task_id": task_id,
                "p_user_id": user_id,
                "p_title": payload.title,
                "p_description": payload.description,
                "p_status": payload.status,
                "p_blocker_reason": payload.blocker_reason,
                "p_due_date": (
                    payload.due_date.isoformat()
                    if payload.due_date else None
                ),
            },
        ).execute()

        if not response.data:
            raise HTTPException(
                status_code=500,
                detail="Task update returned no data."
            )

        return response.data

    except HTTPException:
        raise
    except Exception as exc:
        _rpc_error(exc)

def add_workspace_task_comment(
    task_id: str,
    user_id: str,
    content: str
):
    try:
        response = supabase.rpc(
            "add_workspace_task_comment",
            {
                "p_task_id": task_id,
                "p_user_id": user_id,
                "p_content": content,
            },
        ).execute()

        if not response.data:
            raise HTTPException(
                status_code=500,
                detail="Comment creation returned no data."
            )

        return response.data

    except HTTPException:
        raise
    except Exception as exc:
        _rpc_error(exc)

def list_workspace_task_comments(task_id: str, user_id: str):
    try:
        response = supabase.rpc(
            "get_workspace_task_comments",
            {
                "p_task_id": task_id,
                "p_user_id": user_id,
            },
        ).execute()

        return response.data or {"comments": [], "total": 0}

    except Exception as exc:
        _rpc_error(exc)

def delete_workspace_task(task_id: str, user_id: str):
    try:
        response = supabase.rpc(
            "delete_workspace_task",
            {
                "p_task_id": task_id,
                "p_user_id": user_id,
            },
        ).execute()

        return response.data

    except Exception as exc:
        _rpc_error(exc)

def get_shared_note(
    workspace_id: str,
    resource_id: str,
    user_id: str,
):
    try:
        # Verify workspace membership
        membership = (
            supabase.table("workspace_members")
            .select("user_id")
            .eq("workspace_id", workspace_id)
            .eq("user_id", user_id)
            .execute()
        )

        if not membership.data:
            raise HTTPException(
                status_code=403,
                detail="You are not a member of this workspace.",
            )

        # Verify that the resource is actively shared
        resource_response = (
            supabase.table("workspace_resources")
            .select("*")
            .eq("id", resource_id)
            .eq("workspace_id", workspace_id)
            .eq("resource_type", "note")
            .is_("revoked_at", "null")
            .execute()
        )

        if not resource_response.data:
            raise HTTPException(
                status_code=404,
                detail="Shared note not found or no longer available.",
            )

        resource = resource_response.data[0]
        note_id = resource["resource_id"]

        # Retrieve the note using its UUID
        note_response = (
            supabase.table("notes")
            .select("*")
            .eq("id", note_id)
            .execute()
        )

        if not note_response.data:
            raise HTTPException(
                status_code=404,
                detail="Original note no longer exists.",
            )

        note = note_response.data[0]

        # Retrieve content from the owner's storage folder
        filename = note["filename"]
        owner_id = note["user_id"]

        file_data = supabase.storage.from_("notes").download(
            f"{owner_id}/{filename}"
        )

        return {
            "id": str(note["id"]),
            "title": note.get("title") or filename,
            "subject": note.get("subject"),
            "filename": filename,
            "content": file_data.decode("utf-8"),
        }

    except HTTPException:
        raise

    except Exception as exc:
        print(f"Shared note retrieval error: {exc}")
        raise HTTPException(
            status_code=500,
            detail="Unable to retrieve shared note.",
        )