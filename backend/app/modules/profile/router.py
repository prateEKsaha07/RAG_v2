from app.core.auth import get_current_user
from app.modules.profile.schema import profileResponse, profileUpdate
from fastapi import APIRouter, Depends, HTTPException, status
from app.core.supabase_client import supabase


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

@router.get("/me", response_model=profileResponse)
async def user_profile(
    user=Depends(get_current_user),
):
    res = (
        supabase.table("profiles")
        .select("*")
        .eq("id", user.id)
        .execute()
    )
    if not res.data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Profile not found for this user.",
        )
    return res.data[0]


@router.patch("/me", response_model=profileResponse)
async def update_profile(
    update_data: profileUpdate,
    user=Depends(get_current_user),
):
    payload = update_data.model_dump(exclude_unset=True)
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Update data not found!",
        )
    res = (
        supabase.table("profiles")
        .update(payload)
        .eq("id", user.id)
        .execute()
    )
    if not res.data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Profile not found for this user.",
        )
    return res.data[0]
