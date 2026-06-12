from pydantic import BaseModel, EmailStr
from typing import Optional


class RegisterRequest(BaseModel):
    username: str
    email: EmailStr
    password: str
    first_name: str
    last_name: str


class LoginRequest(BaseModel):
    username: str
    password: str


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user_id: int
    username: str
    role: str


class TokenData(BaseModel):
    user_id: Optional[int] = None
    username: Optional[str] = None
