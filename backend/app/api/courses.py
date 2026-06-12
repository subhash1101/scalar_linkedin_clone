from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload
from typing import List, Optional
import json
from app.db.session import get_db
from app.dependencies.auth import get_current_user
from app.models.user import User
from app.models.course import Course, CourseLesson, CourseProgress

router = APIRouter(prefix="/api/courses", tags=["courses"])


@router.get("")
def list_courses(
    q: Optional[str] = None,
    category: Optional[str] = None,
    level: Optional[str] = None,
    skip: int = 0,
    limit: int = 20,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(Course).options(joinedload(Course.lessons))
    if q:
        query = query.filter(Course.title.ilike(f"%{q}%"))
    if category:
        query = query.filter(Course.category == category)
    if level:
        query = query.filter(Course.level == level)

    courses = query.offset(skip).limit(limit).all()
    result = []
    for c in courses:
        progress = db.query(CourseProgress).filter(
            CourseProgress.course_id == c.id,
            CourseProgress.user_id == current_user.id
        ).first()
        result.append({
            "id": c.id,
            "title": c.title,
            "description": c.description,
            "instructor": c.instructor,
            "thumbnail_url": c.thumbnail_url,
            "duration_hours": c.duration_hours,
            "level": c.level,
            "category": c.category,
            "skills_covered": c.skills_covered,
            "is_free": c.is_free,
            "lesson_count": len(c.lessons),
            "progress": progress.progress_percent if progress else 0,
            "completed": progress.completed if progress else False,
        })
    return result


@router.get("/{course_id}")
def get_course(course_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    course = db.query(Course).options(joinedload(Course.lessons)).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Not found")

    progress = db.query(CourseProgress).filter(
        CourseProgress.course_id == course_id,
        CourseProgress.user_id == current_user.id
    ).first()

    return {
        "id": course.id,
        "title": course.title,
        "description": course.description,
        "instructor": course.instructor,
        "thumbnail_url": course.thumbnail_url,
        "duration_hours": course.duration_hours,
        "level": course.level,
        "category": course.category,
        "skills_covered": course.skills_covered,
        "is_free": course.is_free,
        "lessons": [{"id": l.id, "title": l.title, "duration_minutes": l.duration_minutes, "order_index": l.order_index} for l in sorted(course.lessons, key=lambda x: x.order_index)],
        "lesson_count": len(course.lessons),
        "progress": {
            "progress_percent": progress.progress_percent if progress else 0,
            "completed_lessons": json.loads(progress.completed_lessons) if progress else [],
            "completed": progress.completed if progress else False,
            "certificate_url": progress.certificate_url if progress else None,
        }
    }


@router.post("/{course_id}/start")
def start_course(course_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Not found")

    existing = db.query(CourseProgress).filter(
        CourseProgress.course_id == course_id,
        CourseProgress.user_id == current_user.id
    ).first()

    if not existing:
        progress = CourseProgress(user_id=current_user.id, course_id=course_id)
        db.add(progress)
        db.commit()
    return {"message": "Started"}


@router.post("/{course_id}/complete-lesson/{lesson_id}")
def complete_lesson(course_id: int, lesson_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    course = db.query(Course).options(joinedload(Course.lessons)).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Not found")

    progress = db.query(CourseProgress).filter(
        CourseProgress.course_id == course_id,
        CourseProgress.user_id == current_user.id
    ).first()

    if not progress:
        progress = CourseProgress(user_id=current_user.id, course_id=course_id)
        db.add(progress)
        db.flush()

    completed = json.loads(progress.completed_lessons or "[]")
    if lesson_id not in completed:
        completed.append(lesson_id)
    progress.completed_lessons = json.dumps(completed)

    total_lessons = len(course.lessons)
    if total_lessons > 0:
        progress.progress_percent = round((len(completed) / total_lessons) * 100, 1)

    if len(completed) >= total_lessons and not progress.completed:
        progress.completed = True
        from datetime import datetime
        progress.completed_at = datetime.utcnow()
        progress.certificate_url = f"/certificates/{current_user.id}/{course_id}"

    db.commit()
    return {
        "progress_percent": progress.progress_percent,
        "completed": progress.completed,
        "completed_lessons": completed,
        "certificate_url": progress.certificate_url,
    }


@router.get("/my/enrolled")
def get_enrolled_courses(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    progresses = db.query(CourseProgress).options(
        joinedload(CourseProgress.course).joinedload(Course.lessons)
    ).filter(CourseProgress.user_id == current_user.id).all()

    result = []
    for pr in progresses:
        c = pr.course
        result.append({
            "id": c.id,
            "title": c.title,
            "thumbnail_url": c.thumbnail_url,
            "instructor": c.instructor,
            "progress_percent": pr.progress_percent,
            "completed": pr.completed,
            "certificate_url": pr.certificate_url,
        })
    return result
