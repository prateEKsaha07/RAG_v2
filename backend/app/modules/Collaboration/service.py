from fastapi import HTTPException

from app.core.supabase_client import supabase
from app.modules.Collaboration.schemas import (
    WorkspaceCreate,
    WorkspaceInvite,
)

def _rpc_error(exc: Exception):
    message = str(exc)
    lowered = message.lower()

    if "not authorized" in lowered:
        raise HTTPException(status_code=403, detail="You are not allowed to perform this action.")
    if "not found" in lowered:
        raise HTTPException(status_code=404, detail=message)
    if any(term in lowered for term in (
        "already exists",
        "already a workspace member",
        "cannot invite yourself",
        "pending invitation already exists",
        "no registered user found",
    )):
        raise HTTPException(status_code=409, detail=message)
    if "no registered user found" in lowered:
        raise HTTPException(status_code=404, detail=message)
    raise HTTPException(status_code=500, detail="Collaboration operation failed.")


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