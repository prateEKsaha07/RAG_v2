from supabase_client import supabase
from fastapi import HTTPException, Header
from typing import Optional

async def get_current_user(authorization: Optional[str] = Header(None)):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    token = authorization.replace("Bearer ", "")
    
    try:
        user = supabase.auth.get_user(token)
        return user.user
    except:
        raise HTTPException(status_code=401, detail="Invalid token")