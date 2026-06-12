from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, ForeignKey, Float
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.base import Base


class Course(Base):
    __tablename__ = "courses"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(300), nullable=False)
    description = Column(Text)
    instructor = Column(String(200))
    thumbnail_url = Column(String(500))
    duration_hours = Column(Float)
    level = Column(String(50))
    category = Column(String(100))
    skills_covered = Column(Text)
    is_free = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    lessons = relationship("CourseLesson", back_populates="course", cascade="all, delete-orphan")
    progress = relationship("CourseProgress", back_populates="course", cascade="all, delete-orphan")


class CourseLesson(Base):
    __tablename__ = "course_lessons"

    id = Column(Integer, primary_key=True, index=True)
    course_id = Column(Integer, ForeignKey("courses.id"), nullable=False)
    title = Column(String(300), nullable=False)
    video_url = Column(String(500))
    duration_minutes = Column(Integer)
    order_index = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    course = relationship("Course", back_populates="lessons")


class CourseProgress(Base):
    __tablename__ = "course_progress"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    course_id = Column(Integer, ForeignKey("courses.id"), nullable=False)
    completed_lessons = Column(Text, default="[]")
    progress_percent = Column(Float, default=0.0)
    completed = Column(Boolean, default=False)
    certificate_url = Column(String(500))
    started_at = Column(DateTime(timezone=True), server_default=func.now())
    completed_at = Column(DateTime(timezone=True))

    user = relationship("User", back_populates="course_progress")
    course = relationship("Course", back_populates="progress")
