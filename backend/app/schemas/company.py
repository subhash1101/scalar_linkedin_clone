from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class CompanyCreate(BaseModel):
    name: str
    description: Optional[str] = None
    industry: Optional[str] = None
    company_size: Optional[str] = None
    website: Optional[str] = None
    headquarters: Optional[str] = None
    founded_year: Optional[int] = None


class CompanyUpdate(CompanyCreate):
    pass


class CompanyOut(CompanyCreate):
    id: int
    logo_url: Optional[str] = None
    banner_url: Optional[str] = None
    is_verified: bool
    created_by: Optional[int] = None
    created_at: datetime
    job_count: int = 0

    class Config:
        from_attributes = True
