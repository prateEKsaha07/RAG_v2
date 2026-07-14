from app.core.supabase_client import supabase
from fastapi import HTTPException, Header
from typing import Optional
from fastapi import Request

print("AUTH MODULE LOADED")

async def get_current_user(request: Request,authorization: Optional[str] = Header(None)):
    print("======== REQUEST HEADERS ========")
    print(dict(request.headers))
    print("Authorization Header:", authorization)
    print("================================")
    
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    token = authorization.replace("Bearer ", "")
    
    try:
        user = supabase.auth.get_user(token)
        return user.user
    except:
        raise HTTPException(status_code=401, detail="Invalid token")