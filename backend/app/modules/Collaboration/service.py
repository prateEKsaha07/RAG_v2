
from fastapi import HTTPException

from app.core.supabase_client import supabase
from app.modules.Collaboration.schemas import WorkspaceCreate, WorkspaceInvite


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
