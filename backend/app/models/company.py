from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.base import Base


class Company(Base):
    __tablename__ = "companies"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(200), nullable=False)
    description = Column(Text)
    industry = Column(String(100))
    company_size = Column(String(50))
    website = Column(String(255))
    logo_url = Column(String(500))
    banner_url = Column(String(500))
    headquarters = Column(String(200))
    founded_year = Column(Integer)
    is_verified = Column(Boolean, default=False)
    created_by = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    jobs = relationship("Job", back_populates="company", cascade="all, delete-orphan")
    recruiters = relationship("Recruiter", back_populates="company", cascade="all, delete-orphan")


class Recruiter(Base):
    __tablename__ = "recruiters"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    company_id = Column(Integer, ForeignKey("companies.id"), nullable=False)
    title = Column(String(200))
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User")
    company = relationship("Company", back_populates="recruiters")
