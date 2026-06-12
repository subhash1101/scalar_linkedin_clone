from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Query
from sqlalchemy.orm import Session, joinedload
from typing import List, Optional
from app.db.session import get_db
from app.dependencies.auth import get_current_user, require_recruiter
from app.models.user import User
from app.models.company import Company
from app.models.job import Job, SavedJob, JobApplication, ApplicationStatus, CandidateNote, Interview, JobAlert
from app.schemas.job import JobCreate, JobUpdate, JobApplicationCreate, CandidateNoteCreate, InterviewCreate
from app.utils.files import save_upload

router = APIRouter(prefix="/api/jobs", tags=["jobs"])


def _job_brief(job: Job, current_user_id: int, db: Session):
    company = job.company
    is_saved = db.query(SavedJob).filter(SavedJob.job_id == job.id, SavedJob.user_id == current_user_id).first() is not None
    is_applied = db.query(JobApplication).filter(JobApplication.job_id == job.id, JobApplication.applicant_id == current_user_id).first() is not None
    app_count = len(job.applications)
    return {
        "id": job.id,
        "title": job.title,
        "description": job.description,
        "requirements": job.requirements,
        "benefits": job.benefits,
        "location": job.location,
        "is_remote": job.is_remote,
        "job_type": job.job_type.value,
        "experience_level": job.experience_level.value,
        "salary_min": job.salary_min,
        "salary_max": job.salary_max,
        "is_easy_apply": job.is_easy_apply,
        "is_active": job.is_active,
        "created_at": job.created_at,
        "company": {
            "id": company.id,
            "name": company.name,
            "logo_url": company.logo_url,
            "headquarters": company.headquarters,
        } if company else None,
        "application_count": app_count,
        "is_saved": is_saved,
        "is_applied": is_applied,
    }


@router.get("")
def list_jobs(
    q: Optional[str] = None,
    location: Optional[str] = None,
    job_type: Optional[str] = None,
    experience_level: Optional[str] = None,
    is_remote: Optional[bool] = None,
    company_id: Optional[int] = None,
    skip: int = 0,
    limit: int = 20,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(Job).options(
        joinedload(Job.company),
        joinedload(Job.applications),
    ).filter(Job.is_active == True)

    if q:
        query = query.filter(Job.title.ilike(f"%{q}%") | Job.description.ilike(f"%{q}%"))
    if location:
        query = query.filter(Job.location.ilike(f"%{location}%"))
    if job_type:
        query = query.filter(Job.job_type == job_type)
    if experience_level:
        query = query.filter(Job.experience_level == experience_level)
    if is_remote is not None:
        query = query.filter(Job.is_remote == is_remote)
    if company_id:
        query = query.filter(Job.company_id == company_id)

    jobs = query.order_by(Job.created_at.desc()).offset(skip).limit(limit).all()
    total = query.count()
    return {"jobs": [_job_brief(j, current_user.id, db) for j in jobs], "total": total}


@router.post("")
def create_job(data: JobCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    company = db.query(Company).filter(Company.id == data.company_id).first()
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")

    job = Job(**data.model_dump(), posted_by=current_user.id)
    db.add(job)
    db.commit()
    db.refresh(job)

    job = db.query(Job).options(joinedload(Job.company), joinedload(Job.applications)).filter(Job.id == job.id).first()
    return _job_brief(job, current_user.id, db)


@router.get("/{job_id}")
def get_job(job_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    job = db.query(Job).options(joinedload(Job.company), joinedload(Job.applications)).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    return _job_brief(job, current_user.id, db)


@router.put("/{job_id}")
def update_job(job_id: int, data: JobUpdate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Not found")
    if job.posted_by != current_user.id and current_user.role.value != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")
    for k, v in data.model_dump(exclude_unset=True).items():
        setattr(job, k, v)
    db.commit()
    job = db.query(Job).options(joinedload(Job.company), joinedload(Job.applications)).filter(Job.id == job_id).first()
    return _job_brief(job, current_user.id, db)


@router.delete("/{job_id}")
def delete_job(job_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Not found")
    if job.posted_by != current_user.id and current_user.role.value != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")
    db.delete(job)
    db.commit()
    return {"message": "Deleted"}


@router.post("/{job_id}/save")
def toggle_save(job_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Not found")
    existing = db.query(SavedJob).filter(SavedJob.job_id == job_id, SavedJob.user_id == current_user.id).first()
    if existing:
        db.delete(existing)
        db.commit()
        return {"saved": False}
    saved = SavedJob(job_id=job_id, user_id=current_user.id)
    db.add(saved)
    db.commit()
    return {"saved": True}


@router.get("/saved/list")
def get_saved_jobs(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    saved = db.query(SavedJob).filter(SavedJob.user_id == current_user.id).all()
    result = []
    for s in saved:
        job = db.query(Job).options(joinedload(Job.company), joinedload(Job.applications)).filter(Job.id == s.job_id).first()
        if job:
            result.append(_job_brief(job, current_user.id, db))
    return result


@router.post("/{job_id}/apply")
async def apply_job(
    job_id: int,
    cover_letter: Optional[str] = None,
    resume: Optional[UploadFile] = File(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Not found")

    existing = db.query(JobApplication).filter(
        JobApplication.job_id == job_id,
        JobApplication.applicant_id == current_user.id
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Already applied")

    resume_url = None
    if resume and resume.filename:
        resume_url = await save_upload(resume, "resumes")

    app = JobApplication(
        job_id=job_id,
        applicant_id=current_user.id,
        cover_letter=cover_letter,
        resume_url=resume_url,
    )
    db.add(app)
    db.commit()
    db.refresh(app)
    return {"id": app.id, "status": app.status.value, "applied_at": app.applied_at}


@router.get("/applications/my")
def get_my_applications(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    apps = db.query(JobApplication).options(
        joinedload(JobApplication.job).joinedload(Job.company)
    ).filter(JobApplication.applicant_id == current_user.id).order_by(JobApplication.applied_at.desc()).all()

    result = []
    for a in apps:
        job = _job_brief(a.job, current_user.id, db) if a.job else None
        result.append({
            "id": a.id,
            "job_id": a.job_id,
            "status": a.status.value,
            "cover_letter": a.cover_letter,
            "resume_url": a.resume_url,
            "applied_at": a.applied_at,
            "job": job,
        })
    return result


@router.get("/{job_id}/applicants")
def get_applicants(job_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Not found")
    if job.posted_by != current_user.id and current_user.role.value not in ["recruiter", "admin"]:
        raise HTTPException(status_code=403, detail="Not authorized")

    apps = db.query(JobApplication).options(
        joinedload(JobApplication.applicant).joinedload(User.profile)
    ).filter(JobApplication.job_id == job_id).all()

    result = []
    for a in apps:
        p = a.applicant.profile if a.applicant else None
        result.append({
            "id": a.id,
            "status": a.status.value,
            "cover_letter": a.cover_letter,
            "resume_url": a.resume_url,
            "applied_at": a.applied_at,
            "applicant": {
                "id": a.applicant.id,
                "username": a.applicant.username,
                "profile": {
                    "first_name": p.first_name if p else "",
                    "last_name": p.last_name if p else "",
                    "headline": p.headline if p else None,
                    "avatar_url": p.avatar_url if p else None,
                } if p else None
            }
        })
    return result


@router.put("/applications/{app_id}/status")
def update_application_status(
    app_id: int,
    status: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    app = db.query(JobApplication).filter(JobApplication.id == app_id).first()
    if not app:
        raise HTTPException(status_code=404, detail="Not found")
    try:
        app.status = ApplicationStatus(status)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid status")
    db.commit()
    return {"status": app.status.value}


@router.post("/applications/{app_id}/notes")
def add_candidate_note(app_id: int, data: CandidateNoteCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    note = CandidateNote(application_id=app_id, recruiter_id=current_user.id, note=data.note)
    db.add(note)
    db.commit()
    db.refresh(note)
    return {"id": note.id, "note": note.note, "created_at": note.created_at}


@router.post("/applications/{app_id}/interviews")
def schedule_interview(app_id: int, data: InterviewCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    interview = Interview(application_id=app_id, **data.model_dump())
    db.add(interview)
    db.commit()
    db.refresh(interview)
    return {"id": interview.id, "scheduled_at": interview.scheduled_at, "interview_type": interview.interview_type}


@router.get("/recruiter/posted")
def get_posted_jobs(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    jobs = db.query(Job).options(joinedload(Job.company), joinedload(Job.applications)).filter(
        Job.posted_by == current_user.id
    ).order_by(Job.created_at.desc()).all()
    return [_job_brief(j, current_user.id, db) for j in jobs]
