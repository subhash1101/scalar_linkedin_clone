from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload
from app.db.session import get_db
from app.dependencies.auth import require_admin
from app.models.user import User, UserRole
from app.models.company import Company
from app.models.job import Job
from app.models.report import Report, ReportStatus
from app.models.social import Post

router = APIRouter(prefix="/api/admin", tags=["admin"])


@router.get("/stats")
def get_stats(db: Session = Depends(get_db), _: User = Depends(require_admin)):
    return {
        "users": db.query(User).count(),
        "companies": db.query(Company).count(),
        "jobs": db.query(Job).count(),
        "posts": db.query(Post).count(),
        "reports": db.query(Report).filter(Report.status == ReportStatus.pending).count(),
    }


@router.get("/users")
def list_users(skip: int = 0, limit: int = 50, db: Session = Depends(get_db), _: User = Depends(require_admin)):
    users = db.query(User).options(joinedload(User.profile)).offset(skip).limit(limit).all()
    result = []
    for u in users:
        p = u.profile
        result.append({
            "id": u.id,
            "username": u.username,
            "email": u.email,
            "role": u.role.value,
            "is_active": u.is_active,
            "created_at": u.created_at,
            "name": f"{p.first_name} {p.last_name}" if p else u.username,
        })
    return result


@router.put("/users/{user_id}/role")
def update_role(user_id: int, role: str, db: Session = Depends(get_db), _: User = Depends(require_admin)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Not found")
    try:
        user.role = UserRole(role)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid role")
    db.commit()
    return {"role": user.role.value}


@router.put("/users/{user_id}/toggle-active")
def toggle_active(user_id: int, db: Session = Depends(get_db), _: User = Depends(require_admin)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Not found")
    user.is_active = not user.is_active
    db.commit()
    return {"is_active": user.is_active}


@router.get("/reports")
def list_reports(db: Session = Depends(get_db), _: User = Depends(require_admin)):
    reports = db.query(Report).order_by(Report.created_at.desc()).all()
    return reports


@router.put("/reports/{report_id}/status")
def update_report_status(report_id: int, status: str, db: Session = Depends(get_db), _: User = Depends(require_admin)):
    report = db.query(Report).filter(Report.id == report_id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Not found")
    try:
        report.status = ReportStatus(status)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid status")
    db.commit()
    return {"status": report.status.value}


@router.delete("/jobs/{job_id}")
def admin_delete_job(job_id: int, db: Session = Depends(get_db), _: User = Depends(require_admin)):
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Not found")
    db.delete(job)
    db.commit()
    return {"message": "Deleted"}


@router.delete("/posts/{post_id}")
def admin_delete_post(post_id: int, db: Session = Depends(get_db), _: User = Depends(require_admin)):
    post = db.query(Post).filter(Post.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Not found")
    db.delete(post)
    db.commit()
    return {"message": "Deleted"}
