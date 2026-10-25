from datetime import datetime

from fastapi import APIRouter, Depends

from app.core.auth import get_current_user
from app.core.deps import get_llm, get_vector_store
from app.core.supabase_client import supabase
from app.modules.Roadmap.schema import (
    RoadmapRequest,
    ExtendDateRequest,
    CompleteTopicRequest,
)
from app.modules.Roadmap import services

router = APIRouter(prefix="/roadmap", tags=["roadmap"])


@router.post("")
def generate_roadmap_endpoint(
    request: RoadmapRequest,
    user=Depends(get_current_user),
    llm=Depends(get_llm),
    vector_store=Depends(get_vector_store),
):
    if services.check_existing_roadmap(request.subject, user_id=user.id):
        return {"error": "Active roadmap exists. Complete or delete it first."}

    return services.generate_roadmap(
        subject=request.subject,
        hours_per_day=request.hours_per_day,
        target_date=request.target_date,
        scope=request.scope,
        unit_number=request.unit_number,
        llm=llm,
        user_id=user.id,
        vectorStoreDB=vector_store,
    )


@router.get("/{subject}")
def get_roadmap_endpoint(subject: str, user=Depends(get_current_user)):
    roadmap = services.load_roadmap(subject, user_id=user.id)
    if not roadmap:
        return {"error": "No roadmap found"}
    return roadmap


@router.delete("/{subject}")
def delete_roadmap_endpoint(subject: str, user=Depends(get_current_user)):
    from app.core.text_utils import normalize_subject_key
    needle = normalize_subject_key(subject)
    supabase.table("roadmaps")\
        .delete()\
        .eq("user_id", user.id)\
        .eq("subject_key", needle)\
        .execute()
    return {"success": True, "message": f"Roadmap for {subject} deleted"}


@router.put("/{subject}/extend")
def extend_roadmap_endpoint(
    subject: str,
    request: ExtendDateRequest,
    user=Depends(get_current_user),
):
    roadmap = services.load_roadmap(subject, user_id=user.id)
    if not roadmap:
        return {"error": "No roadmap found"}

    supabase.table("roadmaps").update({
        "target_date": request.new_target_date
    }).eq("id", roadmap["id"]).execute()

    return {"success": True, "new_target_date": request.new_target_date}


@router.put("/{subject}/complete-topic")
def complete_topic_endpoint(
    subject: str,
    request: CompleteTopicRequest,
    user=Depends(get_current_user),
):
    roadmap = services.load_roadmap(subject, user_id=user.id)
    if not roadmap:
        return {"error": "No roadmap found"}

    found = False
    for week in roadmap["weeks"]:
        if week["week"] == request.week:
            for item in week["topics"]:
                if item["topic"]["name"] == request.topic_name:
                    item["topic"]["status"] = "completed"
                    item["topic"]["completed_date"] = datetime.now().strftime("%Y-%m-%d")
                    found = True
                    break

    if not found:
        return {"error": "Topic not found"}

    supabase.table("roadmaps").update({
        "weeks": roadmap["weeks"]
    }).eq("id", roadmap["id"]).execute()

    return {"success": True}