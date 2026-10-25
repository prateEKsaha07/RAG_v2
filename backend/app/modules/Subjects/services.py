from app.core.rag import rag
from app.core.text_utils import normalize_subject_key


def list_subjects() -> list[str]:
    from app.modules.Notes.services import get_subjects
    return get_subjects()


def list_units(subject: str) -> dict:
    if rag.vector_store_db is None:
        return {"error": "Vector store not ready"}

    needle = normalize_subject_key(subject)
    all_docs = list(rag.vector_store_db.docstore._dict.values())
    units = {}
    canonical_name = None

    for doc in all_docs:
        meta = doc.metadata
        haystack = meta.get("subject_key") or normalize_subject_key(meta.get("subject", ""))
        if haystack != needle:
            continue

        canonical_name = canonical_name or meta.get("subject", subject)
        unit_number = meta.get("unit_number")
        if unit_number is None:
            continue

        units[unit_number] = {
            "unit_number": unit_number,
            "unit_name": meta.get("unit_name") or f"Unit {unit_number}",
        }

    return {
        "subject": canonical_name or subject,
        "subject_key": needle,
        "units": sorted(units.values(), key=lambda u: u["unit_number"]),
    }