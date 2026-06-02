from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, status

from backend.app.database import repository
from backend.app.schemas import TokenResponse, UserCreate, UserLogin
from backend.app.utils.security import create_access_token, get_current_user, hash_password, serialize_user, verify_password


router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/signup", response_model=TokenResponse)
async def signup(payload: UserCreate):
    try:
        existing = await repository.find_user_by_email(payload.email)
    except RuntimeError as exc:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail=str(exc)) from exc
    if existing:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email already registered")
    try:
        user = await repository.create_user(
            {
                "name": payload.name,
                "email": payload.email.lower(),
                "hashed_password": hash_password(payload.password),
                "language": payload.language,
                "created_at": datetime.now(timezone.utc),
            }
        )
    except RuntimeError as exc:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail=str(exc)) from exc
    public_user = serialize_user(user)
    token = create_access_token(public_user["id"], {"email": public_user["email"]})
    return {"access_token": token, "user": public_user}


@router.post("/login", response_model=TokenResponse)
async def login(payload: UserLogin):
    try:
        user = await repository.find_user_by_email(payload.email)
    except RuntimeError as exc:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail=str(exc)) from exc
    if user is None or not verify_password(payload.password, user["hashed_password"]):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password")
    public_user = serialize_user(user)
    token = create_access_token(public_user["id"], {"email": public_user["email"]})
    return {"access_token": token, "user": public_user}


@router.get("/me")
async def profile(user=Depends(get_current_user)):
    return serialize_user(user)
