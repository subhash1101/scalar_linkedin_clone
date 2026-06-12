from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime


class ProfileBase(BaseModel):
    first_name: str
    last_name: str
    headline: Optional[str] = None
    bio: Optional[str] = None
    location: Optional[str] = None
    industry: Optional[str] = None
    website: Optional[str] = None
    phone: Optional[str] = None
    open_to_work: Optional[bool] = False


class ProfileUpdate(ProfileBase):
    pass


class ProfileOut(ProfileBase):
    id: int
    user_id: int
    avatar_url: Optional[str] = None
    banner_url: Optional[str] = None
    resume_url: Optional[str] = None
    profile_views: int = 0
    created_at: datetime

    class Config:
        from_attributes = True


class UserBase(BaseModel):
    username: str
    email: EmailStr


class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    password: Optional[str] = None


class UserOut(UserBase):
    id: int
    role: str
    is_active: bool
    created_at: datetime
    profile: Optional[ProfileOut] = None

    class Config:
        from_attributes = True


class UserBrief(BaseModel):
    id: int
    username: str
    profile: Optional[ProfileOut] = None

    class Config:
        from_attributes = True


class ExperienceCreate(BaseModel):
    title: str
    company: str
    employment_type: Optional[str] = None
    location: Optional[str] = None
    is_current: bool = False
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    description: Optional[str] = None


class ExperienceOut(ExperienceCreate):
    id: int
    user_id: int
    created_at: datetime

    class Config:
        from_attributes = True


class EducationCreate(BaseModel):
    school: str
    degree: Optional[str] = None
    field_of_study: Optional[str] = None
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    grade: Optional[str] = None
    description: Optional[str] = None


class EducationOut(EducationCreate):
    id: int
    user_id: int
    created_at: datetime

    class Config:
        from_attributes = True


class SkillOut(BaseModel):
    id: int
    name: str
    endorsement_count: int = 0

    class Config:
        from_attributes = True


class CertificationCreate(BaseModel):
    name: str
    issuing_org: Optional[str] = None
    issue_date: Optional[str] = None
    expiry_date: Optional[str] = None
    credential_id: Optional[str] = None
    credential_url: Optional[str] = None


class CertificationOut(CertificationCreate):
    id: int
    user_id: int
    created_at: datetime

    class Config:
        from_attributes = True


class ProjectCreate(BaseModel):
    title: str
    description: Optional[str] = None
    url: Optional[str] = None
    start_date: Optional[str] = None
    end_date: Optional[str] = None


class ProjectOut(ProjectCreate):
    id: int
    user_id: int
    created_at: datetime

    class Config:
        from_attributes = True


class RecommendationCreate(BaseModel):
    receiver_id: int
    relationship_type: Optional[str] = None
    text: str


class RecommendationOut(BaseModel):
    id: int
    giver_id: int
    receiver_id: int
    relationship_type: Optional[str] = None
    text: str
    created_at: datetime
    giver: Optional[UserBrief] = None

    class Config:
        from_attributes = True
