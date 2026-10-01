from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from database import get_db
from models import User, Student, Faculty, Parent, RoleEnum
from schemas import LoginRequest, TokenResponse, RefreshRequest
from dependencies import (
    hash_password, verify_password, create_access_token,
    create_refresh_token, decode_token, blacklist_token,
    security
)
from fastapi.security import HTTPAuthorizationCredentials

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/login", response_model=TokenResponse)
def login(request: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.username == request.username).first()

    if not user or not verify_password(request.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username or password"
        )

    if not user.is_active:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Account is deactivated")

    if user.role.value != request.role:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"This account is not registered as {request.role}"
        )

    token_data = {"sub": str(user.id), "role": user.role.value}
    access_token = create_access_token(token_data)
    refresh_token = create_refresh_token(token_data)

    # Build user info for frontend
    user_info = {
        "id": str(user.id),
        "username": user.username,
        "email": user.email,
        "role": user.role.value,
    }

    # Attach profile name
    if user.student:
        user_info["name"] = user.student.full_name
    elif user.faculty:
        user_info["name"] = user.faculty.full_name
    elif user.parent:
        user_info["name"] = user.parent.full_name
    else:
        user_info["name"] = user.username

    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        user=user_info
    )


@router.post("/refresh")
def refresh_token(request: RefreshRequest, db: Session = Depends(get_db)):
    payload = decode_token(request.refresh_token)
    if payload.get("type") != "refresh":
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid refresh token")

    user_id = payload.get("sub")
    user = db.query(User).filter(User.id == user_id).first()
    if not user or not user.is_active:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")

    new_access_token = create_access_token({"sub": str(user.id), "role": user.role.value})
    return {"access_token": new_access_token, "token_type": "bearer"}


@router.post("/logout")
def logout(credentials: HTTPAuthorizationCredentials = Depends(security)):
    blacklist_token(credentials.credentials)
    return {"message": "Logged out successfully"}
