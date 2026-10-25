from fastapi import APIRouter, Depends
from app.core.auth import get_current_user
from app.core.deps import get_llm, get_vector_store
from app.modules.Quiz.schema import QuizRequest, EvaluateRequest
from app.modules.Quiz import services

router = APIRouter(prefix="/quiz", tags=["quiz"])

@router.post("/generate-quiz")
def generate_quiz_endpoint(
    request: QuizRequest,
    user=Depends(get_current_user),
    llm=Depends(get_llm),
    vector_store=Depends(get_vector_store),
):
    quiz = services.generate_quiz(
        request.subject,
        llm,
        vector_store,
        unit_number=request.unit_number,
    )
    return {"quiz": quiz}


@router.post("/evaluate")
def evaluate_endpoint(
    request: EvaluateRequest,
    user=Depends(get_current_user),
    vector_store=Depends(get_vector_store),
):
    results, weak_topics = services.evaluate_answers(
        request.quiz,
        request.answers,
        request.subject,
        user_id=user.id,
    )
    recommendations = services.get_recommendations(weak_topics, vector_store)
    return {
        "results": results,
        "weak_topics": weak_topics,
        "recommendations": recommendations,
    }