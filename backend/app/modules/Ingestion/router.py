import shutil
from pathlib import Path

from fastapi import APIRouter, UploadFile, File, HTTPException, Depends

from app.core.rag import rag, reload_vector_store
from app.core.auth import get_current_user
from app.modules.Ingestion import services

router = APIRouter(prefix="/ingestion", tags=["ingestion"])

UPLOAD_DIR = Path("data/uploads")


@router.post("/ingest")
def ingest_endpoint(file: UploadFile = File(...), user=Depends(get_current_user)):
    UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

    if not file.filename or not file.filename.lower().endswith(".md"):
        raise HTTPException(400, "Only .md files are supported.")

    file_path = UPLOAD_DIR / file.filename
    with open(file_path, "wb") as f:
        shutil.copyfileobj(file.file, f)

    try:
        chunk_count = services.run_ingestion(embeddings=rag.embeddings)
    except RuntimeError as e:
        raise HTTPException(503, str(e))

    reload_vector_store()

    return {
        "message": f"{file.filename} ingested successfully",
        "chunks_created": chunk_count,
        "vector_store_ready": rag.vector_store_db is not None,
    }