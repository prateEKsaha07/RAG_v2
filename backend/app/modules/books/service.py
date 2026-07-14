import os
import uuid
from datetime import datetime
import fitz
from fastapi import HTTPException, UploadFile
from app.core.supabase_client import supabase


ALLOWED_TYPES = {
    "application/pdf"
}


async def upload_book(file: UploadFile, user_id: str):

    # Validate file
    if file.content_type not in ALLOWED_TYPES:
        raise HTTPException(
            status_code=400,
            detail="Only PDF files are allowed."
        )

    file_ext = os.path.splitext(file.filename)[1]
    filename = f"{uuid.uuid4()}{file_ext}"
    storage_path = f"{user_id}/{filename}"
    file_bytes = await file.read()
    # Read PDF page count
    try:
        pdf = fitz.open(stream=file_bytes, filetype="pdf")
        total_pages = len(pdf)
        pdf.close()
    except Exception:
        raise HTTPException(
            status_code=400,
            detail="Invalid PDF file."
            )
    # Upload to Supabase Storage
    storage = (
        supabase.storage
        .from_("books")
        .upload(
            storage_path,
            file_bytes,
            {
                "content-type": file.content_type
            }
        )
    )

    # Insert metadata
    data = {
        "user_id": user_id,
        "title": os.path.splitext(file.filename)[0],
        "filename": file.filename,
        "storage_path": storage_path,
        "file_size": len(file_bytes),
        "current_page": 1,
        "total_pages": total_pages,
        "favorite": False,
        "archived": False,
        "uploaded_at": datetime.utcnow().isoformat(),
        "last_opened": datetime.utcnow().isoformat()
    }

    result = (
        supabase
        .table("books")
        .insert(data)
        .execute()
    )

    return {
        "message": "Book uploaded successfully.",
        "book": result.data
    }


async def get_books(user_id: str):
    """
    Return all books for the logged-in user.
    """
    pass


async def get_book(book_id: str, user_id: str):
    """
    Return a single book.
    """
    pass


async def delete_book(book_id: str, user_id: str):
    """
    Delete storage file and database record.
    """
    pass


async def update_progress(book_id: str, current_page: int, user_id: str):
    """
    Update reading progress.
    """
    pass


async def update_last_opened(book_id: str, user_id: str):
    """
    Update last_opened timestamp.
    """
    pass