from datetime import datetime
from pathlib import Path

from app.core.text_utils import normalize_subject_key

UPLOADS_DIR = Path("data/uploads")


def list_uploaded_subjects() -> list[str]:
    files = []
    for file in UPLOADS_DIR.glob("*.md"):
        files.append(file.stem)
    return sorted(files)


def get_upload(subject: str) -> dict:
    needle = normalize_subject_key(subject)

    if not UPLOADS_DIR.exists():
        return {"error": "No uploads directory found"}

    match = None
    for file in UPLOADS_DIR.glob("*.md"):
        if normalize_subject_key(file.stem) == needle:
            match = file
            break

    if not match:
        return {"error": f"No upload found for subject '{subject}'"}

    try:
        content = match.read_text(encoding="utf-8")
        stat = match.stat()
        return {
            "content": content,
            "filename": match.name,
            "size": stat.st_size,
            "uploaded_at": datetime.fromtimestamp(stat.st_mtime).strftime("%Y-%m-%d"),
        }
    except Exception as e:
        return {"error": f"Failed to read upload: {e}"}