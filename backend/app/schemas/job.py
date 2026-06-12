from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


class JobCreate(BaseModel):
    company_id: int
    title: str
    description: Optional[str] = None
    requirements: Optional[str] = None
    benefits: Optional[str] = None
    location: Optional[str] = None
    is_remote: bool = False
    job_type: str = "full_time"
    experience_level: str = "mid_senior"
    salary_min: Optional[int] = None
    salary_max: Optional[int] = None
    is_easy_apply: bool = False


class JobUpdate(JobCreate):
    company_id: Optional[int] = None
    title: Optional[str] = None


class CompanyBrief(BaseModel):
    id: int
    name: str
    logo_url: Optional[str] = None
    headquarters: Optional[str] = None

    class Config:
        from_attributes = True


class JobOut(BaseModel):
    id: int
    company_id: int
    title: str
    description: Optional[str] = None
    requirements: Optional[str] = None
    benefits: Optional[str] = None
    location: Optional[str] = None
    is_remote: bool
    job_type: str
    experience_level: str
    salary_min: Optional[int] = None
    salary_max: Optional[int] = None
    is_easy_apply: bool
    is_active: bool
    created_at: datetime
    company: Optional[CompanyBrief] = None
    application_count: int = 0
    is_saved: bool = False
    is_applied: bool = False

    class Config:
        from_attributes = True


class JobApplicationCreate(BaseModel):
    cover_letter: Optional[str] = None


class JobApplicationOut(BaseModel):
    id: int
    job_id: int
    applicant_id: int
    resume_url: Optional[str] = None
    cover_letter: Optional[str] = None
    status: str
    applied_at: datetime
    job: Optional[JobOut] = None

    class Config:
        from_attributes = True


class CandidateNoteCreate(BaseModel):
    note: str


class InterviewCreate(BaseModel):
    scheduled_at: datetime
    duration_minutes: int = 60
    interview_type: str = "video"
    location: Optional[str] = None
    notes: Optional[str] = None
