
from fastapi import APIRouter, Depends, status

from app.core.auth import get_current_user
from app.modules.Collaboration.schemas import WorkspaceCreate, WorkspaceInvite
from app.modules.Collaboration.service import (
    create_workspace,
    list_workspaces,
    create_invitation,
    list_invitations,
    respond_to_invitation,
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
