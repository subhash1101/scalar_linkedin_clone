from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, ForeignKey, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.base import Base
import enum


class JobType(str, enum.Enum):
    full_time = "full_time"
    part_time = "part_time"
    contract = "contract"
    temporary = "temporary"
    internship = "internship"
    volunteer = "volunteer"


class ExperienceLevel(str, enum.Enum):
    internship = "internship"
    entry = "entry"
    associate = "associate"
    mid_senior = "mid_senior"
    director = "director"
    executive = "executive"


class ApplicationStatus(str, enum.Enum):
    applied = "applied"
    reviewing = "reviewing"
    shortlisted = "shortlisted"
    interview = "interview"
    rejected = "rejected"
    hired = "hired"
    withdrawn = "withdrawn"


class Job(Base):
    __tablename__ = "jobs"

    id = Column(Integer, primary_key=True, index=True)
    company_id = Column(Integer, ForeignKey("companies.id"), nullable=False)
    posted_by = Column(Integer, ForeignKey("users.id"))
    title = Column(String(200), nullable=False)
    description = Column(Text)
    requirements = Column(Text)
    benefits = Column(Text)
    location = Column(String(200))
    is_remote = Column(Boolean, default=False)
    job_type = Column(Enum(JobType), default=JobType.full_time)
    experience_level = Column(Enum(ExperienceLevel), default=ExperienceLevel.mid_senior)
    salary_min = Column(Integer)
    salary_max = Column(Integer)
    is_easy_apply = Column(Boolean, default=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    company = relationship("Company", back_populates="jobs")
    applications = relationship("JobApplication", back_populates="job", cascade="all, delete-orphan")
    saved_by = relationship("SavedJob", back_populates="job", cascade="all, delete-orphan")


class SavedJob(Base):
    __tablename__ = "saved_jobs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    job_id = Column(Integer, ForeignKey("jobs.id"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="saved_jobs")
    job = relationship("Job", back_populates="saved_by")


class JobApplication(Base):
    __tablename__ = "job_applications"

    id = Column(Integer, primary_key=True, index=True)
    job_id = Column(Integer, ForeignKey("jobs.id"), nullable=False)
    applicant_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    resume_url = Column(String(500))
    cover_letter = Column(Text)
    status = Column(Enum(ApplicationStatus), default=ApplicationStatus.applied)
    notes = Column(Text)
    applied_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    job = relationship("Job", back_populates="applications")
    applicant = relationship("User", back_populates="job_applications")
    candidate_notes = relationship("CandidateNote", back_populates="application", cascade="all, delete-orphan")
    interviews = relationship("Interview", back_populates="application", cascade="all, delete-orphan")


class JobAlert(Base):
    __tablename__ = "job_alerts"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    keywords = Column(String(500))
    location = Column(String(200))
    job_type = Column(String(50))
    frequency = Column(String(20), default="weekly")
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="job_alerts")


class CandidateNote(Base):
    __tablename__ = "candidate_notes"

    id = Column(Integer, primary_key=True, index=True)
    application_id = Column(Integer, ForeignKey("job_applications.id"), nullable=False)
    recruiter_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    note = Column(Text, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    application = relationship("JobApplication", back_populates="candidate_notes")
    recruiter = relationship("User")


class Interview(Base):
    __tablename__ = "interviews"

    id = Column(Integer, primary_key=True, index=True)
    application_id = Column(Integer, ForeignKey("job_applications.id"), nullable=False)
    scheduled_at = Column(DateTime(timezone=True))
    duration_minutes = Column(Integer, default=60)
    interview_type = Column(String(50), default="video")
    location = Column(String(300))
    notes = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    application = relationship("JobApplication", back_populates="interviews")
