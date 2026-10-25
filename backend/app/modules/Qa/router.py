from fastapi import APIRouter, Depends
from app.core.auth import get_current_user
from app.core.deps import get_llm, get_vector_store, get_embeddings
from app.modules.Qa.schema import AskRequest
from app.modules.Qa import services

router = APIRouter(prefix="/qa", tags=["qa"])


@router.post("/ask")
def ask_endpoint(
    request: AskRequest,
    user=Depends(get_current_user),
    llm=Depends(get_llm),
    vector_store=Depends(get_vector_store),
    embeddings=Depends(get_embeddings),
):
    return services.get_answer(
        question=request.question,
        llm=llm,
        uploads_db=vector_store,
        user_id=user.id,
        embeddings=embeddings,
        subject=request.subject,
        general_knowledge=request.general_knowledge,
        session_id=user.id,
    )