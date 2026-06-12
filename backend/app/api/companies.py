from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.db.session import get_db
from app.dependencies.auth import get_current_user, require_admin
from app.models.user import User
from app.models.company import Company
from app.models.job import Job
from app.schemas.company import CompanyCreate, CompanyUpdate, CompanyOut
from app.utils.files import save_upload

router = APIRouter(prefix="/api/companies", tags=["companies"])


@router.get("")
def list_companies(
    q: Optional[str] = None,
    skip: int = 0,
    limit: int = 20,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user)
):
    query = db.query(Company)
    if q:
        query = query.filter(Company.name.ilike(f"%{q}%"))
    companies = query.offset(skip).limit(limit).all()
    result = []
    for c in companies:
        job_count = db.query(Job).filter(Job.company_id == c.id, Job.is_active == True).count()
        d = {k: getattr(c, k) for k in ["id", "name", "description", "industry", "company_size", "website", "logo_url", "banner_url", "headquarters", "founded_year", "is_verified", "created_by", "created_at"]}
        d["job_count"] = job_count
        result.append(d)
    return result


@router.post("")
def create_company(data: CompanyCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    company = Company(**data.model_dump(), created_by=current_user.id)
    db.add(company)
    db.commit()
    db.refresh(company)
    return company


@router.get("/{company_id}")
def get_company(company_id: int, db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    company = db.query(Company).filter(Company.id == company_id).first()
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")
    job_count = db.query(Job).filter(Job.company_id == company_id, Job.is_active == True).count()
    d = {k: getattr(company, k) for k in ["id", "name", "description", "industry", "company_size", "website", "logo_url", "banner_url", "headquarters", "founded_year", "is_verified", "created_by", "created_at"]}
    d["job_count"] = job_count
    return d


@router.put("/{company_id}")
def update_company(company_id: int, data: CompanyUpdate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    company = db.query(Company).filter(Company.id == company_id).first()
    if not company:
        raise HTTPException(status_code=404, detail="Not found")
    if company.created_by != current_user.id and current_user.role.value != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")
    for k, v in data.model_dump(exclude_unset=True).items():
        setattr(company, k, v)
    db.commit()
    db.refresh(company)
    return company


@router.post("/{company_id}/logo")
async def upload_logo(company_id: int, file: UploadFile = File(...), current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    company = db.query(Company).filter(Company.id == company_id).first()
    if not company:
        raise HTTPException(status_code=404, detail="Not found")
    url = await save_upload(file, "avatars")
    company.logo_url = url
    db.commit()
    return {"logo_url": url}
