
from fastapi import APIRouter, Depends, status

from app.core.auth import get_current_user
from app.modules.Collaboration.schemas import (
    WorkspaceCreate,
    WorkspaceInvite,
    WorkspaceMemberResponse,
    WorkspaceRoleUpdate,
    
)
from app.modules.Collaboration.service import (
    create_workspace,
    list_workspaces,
    create_invitation,
    list_invitations,
    respond_to_invitation,
    list_workspace_members,
    update_workspace_member_role,
    remove_workspace_member,
)
router = APIRouter(
    prefix="/collaboration",
    tags=["Collaboration"],
)

@router.post("/workspaces", status_code=status.HTTP_201_CREATED)
def create_workspace_endpoint(
    payload: WorkspaceCreate,
    current_user=Depends(get_current_user),
):
    return create_workspace(payload, str(current_user.id))


@router.get("/workspaces")
def list_workspaces_endpoint(
    current_user=Depends(get_current_user),
):
    return list_workspaces(str(current_user.id))


@router.post(
    "/workspaces/{workspace_id}/invitations",
    status_code=status.HTTP_201_CREATED,
)
def create_invitation_endpoint(
    workspace_id: str,
    payload: WorkspaceInvite,
    current_user=Depends(get_current_user),
):
    return create_invitation(
        workspace_id,
        payload,
        str(current_user.id),
    )


@router.get("/invitations")
def list_invitations_endpoint(
    current_user=Depends(get_current_user),
):
    return list_invitations(
        user_id=str(current_user.id),
        user_email=getattr(current_user, "email", None),
    )


@router.post("/invitations/{invitation_id}/accept")
def accept_invitation_endpoint(
    invitation_id: str,
    current_user=Depends(get_current_user),
):
    return respond_to_invitation(
        invitation_id,
        str(current_user.id),
        "accepted",
    )


@router.post("/invitations/{invitation_id}/reject")
def reject_invitation_endpoint(
    invitation_id: str,
    current_user=Depends(get_current_user),
):
    return respond_to_invitation(
        invitation_id,
        str(current_user.id),
        "rejected",
    )

@router.get(
    "/workspaces/{workspace_id}/members",
    response_model=list[WorkspaceMemberResponse],
)
def list_workspace_members_endpoint(
    workspace_id: str,
    current_user=Depends(get_current_user),
):
    return list_workspace_members(
        workspace_id,
        str(current_user.id),
    )


@router.patch(
    "/workspaces/{workspace_id}/members/{user_id}/role"
)
def update_workspace_member_role_endpoint(
    workspace_id: str,
    user_id: str,
    payload: WorkspaceRoleUpdate,
    current_user=Depends(get_current_user),
):
    return update_workspace_member_role(
        workspace_id=workspace_id,
        target_user_id=user_id,
        actor_id=str(current_user.id),
        new_role=payload.role,
    )

@router.delete(
    "/workspaces/{workspace_id}/members/{user_id}"
)
def remove_workspace_member_endpoint(
    workspace_id: str,
    user_id: str,
    current_user=Depends(get_current_user),
):
    return remove_workspace_member(
        workspace_id=workspace_id,
        target_user_id=user_id,
        actor_id=str(current_user.id),
    )