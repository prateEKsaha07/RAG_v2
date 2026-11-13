
from fastapi import APIRouter, Depends, status, Query, UploadFile, File
from datetime import datetime
from app.core.auth import get_current_user
from app.modules.Collaboration.schemas import (
    WorkspaceCreate,
    WorkspaceInvite,
    WorkspaceMemberResponse,
    WorkspaceRoleUpdate,
    WorkspaceNoteShare,
    WorkspaceMessageCreate,
    WorkspaceUpdateResponse,
    CreatePollRequest,
    CastPollVoteRequest,
    PinPollRequest,
    CreateWorkspaceTaskRequest,
    UpdateWorkspaceTaskRequest,
    CreateTaskCommentRequest,
    SharedResourceResponse
)
from app.modules.Collaboration.service import (
    create_workspace,
    delete_workspace_task,
    get_shared_note,
    list_workspace_task_comments,
    list_workspaces,
    create_invitation,
    list_invitations,
    respond_to_invitation,
    list_workspace_members,
    update_workspace_member_role,
    remove_workspace_member,
    share_workspace_note,
    list_workspace_resources,
    revoke_workspace_resource,
    send_workspace_message,
    get_workspace_messages,
    get_workspace_updates,
    create_workspace_poll,
    list_workspace_polls,
    get_workspace_poll_details,
    cast_workspace_poll_vote,
    close_workspace_poll,
    set_workspace_poll_pin,
    create_workspace_task,
    list_workspace_tasks,
    update_workspace_task,
    add_workspace_task_comment,
    share_workspace_file,
    get_shared_resource,
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


@router.post(
    "/workspaces/{workspace_id}/resources/notes",
    status_code=status.HTTP_201_CREATED,
)
def share_workspace_note_endpoint(
    workspace_id: str,
    payload: WorkspaceNoteShare,
    current_user=Depends(get_current_user),
):
    return share_workspace_note(
        workspace_id=workspace_id,
        note_id=str(payload.note_id),
        actor_id=str(current_user.id),
    )


@router.get("/workspaces/{workspace_id}/resources")
def list_workspace_resources_endpoint(
    workspace_id: str,
    current_user=Depends(get_current_user),
):
    return list_workspace_resources(
        workspace_id=workspace_id,
        user_id=str(current_user.id),
    )


@router.delete(
    "/workspaces/{workspace_id}/resources/{resource_id}"
)
def revoke_workspace_resource_endpoint(
    workspace_id: str,
    resource_id: str,
    current_user=Depends(get_current_user),
):
    return revoke_workspace_resource(
        workspace_id=workspace_id,
        resource_id=resource_id,
        actor_id=str(current_user.id),
    )


@router.get(
    "/workspaces/{workspace_id}/resources/{resource_id}/note"
)
def get_shared_note_endpoint(
    workspace_id: str,
    resource_id: str,
    current_user=Depends(get_current_user),
):
    return get_shared_note(
        workspace_id=workspace_id,
        resource_id=resource_id,
        user_id=str(current_user.id),
    )


@router.post(
    "/workspaces/{workspace_id}/messages",
    status_code=status.HTTP_201_CREATED,
)
def send_workspace_message_endpoint(
    workspace_id: str,
    payload: WorkspaceMessageCreate,
    current_user=Depends(get_current_user),
):
    return send_workspace_message(
        workspace_id=workspace_id,
        sender_id=str(current_user.id),
        content=payload.content,
        referenced_type=payload.referenced_type,
        referenced_id=(
            str(payload.referenced_id) if payload.referenced_id else None
        ),
    )

@router.get("/workspaces/{workspace_id}/messages")
def get_workspace_messages_endpoint(
    workspace_id: str,
    limit: int = 50,
    before: str | None = None,
    current_user=Depends(get_current_user),
):
    return get_workspace_messages(
        workspace_id=workspace_id,
        user_id=str(current_user.id),
        limit=limit,
        before=before,
    )


@router.get(
    "/workspaces/{workspace_id}/updates",
    response_model=WorkspaceUpdateResponse
)
def get_workspace_updates_route(
    workspace_id: str,
    limit: int = Query(default=50, ge=1, le=100),
    after: datetime | None = None,
    current_user=Depends(get_current_user)
):
    result = get_workspace_updates(
        workspace_id=workspace_id,
        user_id=str(current_user.id),
        limit=limit,
        after=after.isoformat() if after else None
    )

    return result


@router.post(
    "/workspaces/{workspace_id}/polls",
    status_code=status.HTTP_201_CREATED,
)
def create_workspace_poll_endpoint(
    workspace_id: str,
    payload: CreatePollRequest,
    current_user=Depends(get_current_user),
):
    return create_workspace_poll(
        workspace_id=workspace_id,
        user_id=str(current_user.id),
        payload=payload,
    )


@router.get("/workspaces/{workspace_id}/polls")
def list_workspace_polls_endpoint(
    workspace_id: str,
    current_user=Depends(get_current_user),
):
    return list_workspace_polls(
        workspace_id=workspace_id,
        user_id=str(current_user.id),
    )


@router.get("/polls/{poll_id}")
def get_workspace_poll_details_endpoint(
    poll_id: str,
    current_user=Depends(get_current_user),
):
    return get_workspace_poll_details(
        poll_id=poll_id,
        user_id=str(current_user.id),
    )


@router.post("/polls/{poll_id}/vote")
def cast_workspace_poll_vote_endpoint(
    poll_id: str,
    payload: CastPollVoteRequest,
    current_user=Depends(get_current_user),
):
    return cast_workspace_poll_vote(
        poll_id=poll_id,
        option_id=payload.option_id,
        user_id=str(current_user.id),
    )


@router.patch("/polls/{poll_id}/close")
def close_workspace_poll_endpoint(
    poll_id: str,
    current_user=Depends(get_current_user),
):
    return close_workspace_poll(
        poll_id=poll_id,
        user_id=str(current_user.id),
    )


@router.patch("/polls/{poll_id}/pin")
def set_workspace_poll_pin_endpoint(
    poll_id: str,
    payload: PinPollRequest,
    current_user=Depends(get_current_user),
):
    return set_workspace_poll_pin(
        poll_id=poll_id,
        user_id=str(current_user.id),
        is_pinned=payload.is_pinned,
    )


@router.post(
    "/workspaces/{workspace_id}/tasks",
    status_code=status.HTTP_201_CREATED
)
def create_workspace_task_endpoint(
    workspace_id: str,
    payload: CreateWorkspaceTaskRequest,
    current_user=Depends(get_current_user),
):
    return create_workspace_task(
        workspace_id=workspace_id,
        user_id=str(current_user.id),
        payload=payload,
    )


@router.get("/workspaces/{workspace_id}/tasks")
def list_workspace_tasks_endpoint(
    workspace_id: str,
    current_user=Depends(get_current_user),
):
    return list_workspace_tasks(
        workspace_id=workspace_id,
        user_id=str(current_user.id),
    )


@router.patch("/tasks/{task_id}")
def update_workspace_task_endpoint(
    task_id: str,
    payload: UpdateWorkspaceTaskRequest,
    current_user=Depends(get_current_user),
):
    return update_workspace_task(
        task_id=task_id,
        user_id=str(current_user.id),
        payload=payload,
    )


@router.post("/tasks/{task_id}/comments", status_code=status.HTTP_201_CREATED)
def add_workspace_task_comment_endpoint(
    task_id: str,
    payload: CreateTaskCommentRequest,
    current_user=Depends(get_current_user),
):
    return add_workspace_task_comment(
        task_id=task_id,
        user_id=str(current_user.id),
        content=payload.content,
    )


@router.get("/tasks/{task_id}/comments")
def list_workspace_task_comments_endpoint(
    task_id: str,
    current_user=Depends(get_current_user),
):
    return list_workspace_task_comments(
        task_id=task_id,
        user_id=str(current_user.id),
    )


@router.delete("/tasks/{task_id}")
def delete_workspace_task_endpoint(
    task_id: str,
    current_user=Depends(get_current_user),
):
    return delete_workspace_task(
        task_id=task_id,
        user_id=str(current_user.id),
    )


@router.post(
    "/workspaces/{workspace_id}/resources/files",
    status_code=status.HTTP_201_CREATED,
)
async def share_workspace_file_endpoint(
    workspace_id: str,
    file: UploadFile = File(...),
    current_user=Depends(get_current_user),
):
    content = await file.read()
    return share_workspace_file(
        workspace_id=workspace_id,
        actor_id=str(current_user.id),
        filename=file.filename or "file",
        content_type=file.content_type,
        file_bytes=content,
    )



@router.get(
    "/workspaces/{workspace_id}/resources/{resource_id}",
    response_model=SharedResourceResponse,
)
def get_shared_resource_endpoint(
    workspace_id: str,
    resource_id: str,
    current_user=Depends(get_current_user),
):
    return get_shared_resource(
        workspace_id=workspace_id,
        resource_id=resource_id,
        user_id=str(current_user.id),
    )

