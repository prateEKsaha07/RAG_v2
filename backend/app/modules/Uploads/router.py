from fastapi import APIRouter
from app.modules.Uploads import services

router = APIRouter(tags=["uploads"])


@router.get("/uploads")
def get_uploaded_subjects():
    return services.list_uploaded_subjects()


@router.get("/uploads/{subject}")
def get_upload_content(subject: str):
    return services.get_upload(subject)