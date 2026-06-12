from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, ForeignKey, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.base import Base
import enum


class UserRole(str, enum.Enum):
    user = "user"
    recruiter = "recruiter"
    admin = "admin"


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, index=True, nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    role = Column(Enum(UserRole), default=UserRole.user)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    profile = relationship("Profile", back_populates="user", uselist=False, cascade="all, delete-orphan")
    experiences = relationship("Experience", back_populates="user", cascade="all, delete-orphan")
    educations = relationship("Education", back_populates="user", cascade="all, delete-orphan")
    user_skills = relationship("UserSkill", back_populates="user", cascade="all, delete-orphan")
    certifications = relationship("Certification", back_populates="user", cascade="all, delete-orphan")
    projects = relationship("Project", back_populates="user", cascade="all, delete-orphan")
    posts = relationship("Post", back_populates="author", cascade="all, delete-orphan")
    post_likes = relationship("PostLike", back_populates="user", cascade="all, delete-orphan")
    comments = relationship("Comment", back_populates="author", cascade="all, delete-orphan")
    reposts = relationship("Repost", back_populates="user", cascade="all, delete-orphan")
    notifications = relationship("Notification", foreign_keys="Notification.recipient_id", back_populates="recipient", cascade="all, delete-orphan")
    sent_recommendations = relationship("Recommendation", foreign_keys="Recommendation.giver_id", back_populates="giver")
    received_recommendations = relationship("Recommendation", foreign_keys="Recommendation.receiver_id", back_populates="receiver")
    saved_jobs = relationship("SavedJob", back_populates="user", cascade="all, delete-orphan")
    job_applications = relationship("JobApplication", back_populates="applicant", cascade="all, delete-orphan")
    job_alerts = relationship("JobAlert", back_populates="user", cascade="all, delete-orphan")
    course_progress = relationship("CourseProgress", back_populates="user", cascade="all, delete-orphan")
    reports = relationship("Report", foreign_keys="Report.reporter_id", back_populates="reporter")


class Profile(Base):
    __tablename__ = "profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    first_name = Column(String(100), nullable=False)
    last_name = Column(String(100), nullable=False)
    headline = Column(String(220))
    bio = Column(Text)
    location = Column(String(200))
    industry = Column(String(100))
    avatar_url = Column(String(500))
    banner_url = Column(String(500))
    resume_url = Column(String(500))
    website = Column(String(255))
    phone = Column(String(20))
    profile_views = Column(Integer, default=0)
    open_to_work = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    user = relationship("User", back_populates="profile")


class Experience(Base):
    __tablename__ = "experiences"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    title = Column(String(200), nullable=False)
    company = Column(String(200), nullable=False)
    employment_type = Column(String(50))
    location = Column(String(200))
    is_current = Column(Boolean, default=False)
    start_date = Column(String(20))
    end_date = Column(String(20))
    description = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="experiences")


class Education(Base):
    __tablename__ = "educations"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    school = Column(String(200), nullable=False)
    degree = Column(String(200))
    field_of_study = Column(String(200))
    start_date = Column(String(20))
    end_date = Column(String(20))
    grade = Column(String(50))
    description = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="educations")


class Skill(Base):
    __tablename__ = "skills"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, nullable=False)

    user_skills = relationship("UserSkill", back_populates="skill")


class UserSkill(Base):
    __tablename__ = "user_skills"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    skill_id = Column(Integer, ForeignKey("skills.id"), nullable=False)
    endorsement_count = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="user_skills")
    skill = relationship("Skill", back_populates="user_skills")


class Certification(Base):
    __tablename__ = "certifications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    name = Column(String(200), nullable=False)
    issuing_org = Column(String(200))
    issue_date = Column(String(20))
    expiry_date = Column(String(20))
    credential_id = Column(String(200))
    credential_url = Column(String(500))
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="certifications")


class Project(Base):
    __tablename__ = "projects"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    title = Column(String(200), nullable=False)
    description = Column(Text)
    url = Column(String(500))
    start_date = Column(String(20))
    end_date = Column(String(20))
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="projects")


class Recommendation(Base):
    __tablename__ = "recommendations"

    id = Column(Integer, primary_key=True, index=True)
    giver_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    receiver_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    relationship_type = Column(String(200))
    text = Column(Text, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    giver = relationship("User", primaryjoin="Recommendation.giver_id == User.id", back_populates="sent_recommendations")
    receiver = relationship("User", primaryjoin="Recommendation.receiver_id == User.id", back_populates="received_recommendations")
