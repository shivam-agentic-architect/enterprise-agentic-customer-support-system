from datetime import timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from uuid import UUID

from ...database.session import get_db
from ...core.security import get_password_hash, create_access_token, create_refresh_token, verify_password, decode_token
from ...schemas.index import UserCreate, UserResponse, Token, LoginRequest, RefreshRequest
from ...models.index import User
from ...services.auth_service import get_user_by_email, get_current_user

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register(obj_in: UserCreate, db: AsyncSession = Depends(get_db)):
    user = await get_user_by_email(db, obj_in.email)
    if user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A user with this email is already registered."
        )
    
    # Hash password and create record
    hashed = get_password_hash(obj_in.password)
    db_obj = User(
        email=obj_in.email,
        hashed_password=hashed,
        full_name=obj_in.full_name,
        role=obj_in.role
    )
    db.add(db_obj)
    await db.commit()
    await db.refresh(db_obj)
    return db_obj

@router.post("/login", response_model=Token)
async def login(credentials: LoginRequest, db: AsyncSession = Depends(get_db)):
    user = await get_user_by_email(db, credentials.email)
    if not user or not verify_password(credentials.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password parameters."
        )
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User profile is currently inactive."
        )

    # Issue access and refresh tokens
    access = create_access_token(user.id)
    refresh = create_refresh_token(user.id)
    return {
        "access_token": access,
        "refresh_token": refresh,
        "token_type": "bearer"
    }

@router.post("/refresh", response_model=Token)
async def refresh(payload: RefreshRequest, db: AsyncSession = Depends(get_db)):
    decoded = decode_token(payload.refresh_token)
    user_id_str = decoded.get("sub")
    t_type = decoded.get("type")
    
    if not user_id_str or t_type != "refresh":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token payload."
        )

    try:
        user_uuid = UUID(user_id_str)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid subject uuid parameters."
        )

    query = select(User).filter(User.id == user_uuid, User.is_deleted == False)
    result = await db.execute(query)
    user = result.scalars().first()
    
    if not user or not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User profile not active."
        )

    # Renew token sets
    new_access = create_access_token(user.id)
    new_refresh = create_refresh_token(user.id)
    
    return {
        "access_token": new_access,
        "refresh_token": new_refresh,
        "token_type": "bearer"
    }

@router.post("/logout")
async def logout():
    return {"message": "Session logged out successfully."}

@router.get("/profile", response_model=UserResponse)
async def get_profile(current_user: User = Depends(get_current_user)):
    return current_user
