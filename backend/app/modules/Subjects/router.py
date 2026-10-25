from fastapi import APIRouter
from app.modules.Subjects import services

router = APIRouter(tags=["subjects"])


@router.get("/subjects")
def get_subjects_endpoint():
    return {"subjects": services.list_subjects()}


@router.get("/subjects/{subject}/units")
def get_subject_units_endpoint(subject: str):
    return services.list_units(subject)