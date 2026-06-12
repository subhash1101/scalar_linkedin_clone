from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


class CourseLessonOut(BaseModel):
    id: int
    title: str
    video_url: Optional[str] = None
    duration_minutes: Optional[int] = None
    order_index: int

    class Config:
        from_attributes = True


class CourseOut(BaseModel):
    id: int
    title: str
    description: Optional[str] = None
    instructor: Optional[str] = None
    thumbnail_url: Optional[str] = None
    duration_hours: Optional[float] = None
    level: Optional[str] = None
    category: Optional[str] = None
    skills_covered: Optional[str] = None
    is_free: bool
    created_at: datetime
    lessons: List[CourseLessonOut] = []
    lesson_count: int = 0

    class Config:
        from_attributes = True


class CourseProgressOut(BaseModel):
    id: int
    user_id: int
    course_id: int
    completed_lessons: str = "[]"
    progress_percent: float = 0.0
    completed: bool
    certificate_url: Optional[str] = None
    started_at: datetime
    completed_at: Optional[datetime] = None

    class Config:
        from_attributes = True
