from fastapi import APIRouter, Depends
from app.core.auth import get_current_user
from app.core.deps import get_llm, get_embeddings
from app.core.rag import rag
from app.modules.Notes.schema import (
    GenerateTagsRequest,
    SubjectTagsRequest,
    FetchURLRequest,
    CreateNoteRequest,
    UpdateNoteRequest,
)
from app.modules.Notes import services

router = APIRouter(prefix="/notes", tags=["notes"])


# --- Specific routes MUST come before /{filename} ---

@router.post("/generate-tags")
def generate_tags_endpoint(
    request: GenerateTagsRequest,
    llm=Depends(get_llm),
):
    tags = services.generate_tags(request.note_content, request.subject, llm)
    return {"tags": tags}


@router.post("/fetch-url")
def fetch_url_endpoint(request: FetchURLRequest):
    return {"title": services.fetch_url_title(request.url)}


@router.post("/subject-tags")
def get_subject_tags_endpoint(request: SubjectTagsRequest):
    return {"tags": services.load_tags(request.subject)}


@router.post("/ingest")
def ingest_notes_endpoint(
    user=Depends(get_current_user),
    embeddings=Depends(get_embeddings),
):
    from langchain_community.vectorstores import FAISS
    from app.modules.Notes.services import get_notes_faiss_path

    result = services.ingest_notes(embeddings, user.id)

    if "error" in result:
        return result

    rag.notes_dbs[user.id] = FAISS.load_local(
        get_notes_faiss_path(user.id),
        embeddings,
        allow_dangerous_deserialization=True,
    )
    return result


@router.post("")
def create_note_endpoint(
    request: CreateNoteRequest,
    user=Depends(get_current_user),
):
    return services.create_note(
        subject=request.subject,
        title=request.title,
        content=request.content,
        tags=request.tags,
        urls=request.urls,
        user_id=user.id,
    )


@router.get("")
def get_notes_endpoint(
    subject: str = None,
    tags: str = None,
    user=Depends(get_current_user),
):
    tag_list = tags.split(",") if tags else None
    notes = services.get_all_notes(subject, tag_list, user_id=user.id)
    return {"notes": notes}


@router.get("/{filename}")
def get_note_content_endpoint(
    filename: str,
    user=Depends(get_current_user),
):
    return services.get_note_content(filename, user_id=user.id)


@router.put("/{filename}")
def update_note_endpoint(
    filename: str,
    request: UpdateNoteRequest,
    user=Depends(get_current_user),
):
    return services.update_note(
        filename=filename,
        title=request.title,
        content=request.content,
        tags=request.tags,
        urls=request.urls,
        user_id=user.id,
    )


@router.delete("/{filename}")
def delete_note_endpoint(
    filename: str,
    user=Depends(get_current_user),
):
    return services.delete_note(filename, user_id=user.id)