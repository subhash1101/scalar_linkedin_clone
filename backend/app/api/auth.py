from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.schemas.auth import RegisterRequest, LoginRequest, Token
from app.models.user import User, Profile
from app.core.security import get_password_hash, verify_password, create_access_token

router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.post("/register", response_model=Token)
def register(payload: RegisterRequest, db: Session = Depends(get_db)):
    if db.query(User).filter(User.username == payload.username).first():
        raise HTTPException(status_code=400, detail="Username already taken")
    if db.query(User).filter(User.email == payload.email).first():
        raise HTTPException(status_code=400, detail="Email already registered")

    user = User(
        username=payload.username,
        email=payload.email,
        hashed_password=get_password_hash(payload.password),
    )
    db.add(user)
    db.flush()

    profile = Profile(
        user_id=user.id,
        first_name=payload.first_name,
        last_name=payload.last_name,
    )
    db.add(profile)
    db.commit()
    db.refresh(user)

    token = create_access_token({"sub": str(user.id)})
    return Token(access_token=token, user_id=user.id, username=user.username, role=user.role.value)


@router.post("/login", response_model=Token)
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.username == payload.username).first()
    if not user or not verify_password(payload.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    if not user.is_active:
        raise HTTPException(status_code=403, detail="Account disabled")

    token = create_access_token({"sub": str(user.id)})
    return Token(access_token=token, user_id=user.id, username=user.username, role=user.role.value)


@router.post("/logout")
def logout():
    return {"message": "Logged out successfully"}
