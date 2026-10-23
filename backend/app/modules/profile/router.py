from app.core.auth import get_current_user
from app.modules.profile.schema import profileResponse, profileUpdate
from fastapi import APIRouter, Depends


router = APIRouter(
    prefix="/profiles",
    tags=["profile endpoints"],
)

@router.get("/test")
def test_auth(
    user = Depends(get_current_user)
    ):
    return{
        "message": "profiles modules in active",
        "user" : user
    }