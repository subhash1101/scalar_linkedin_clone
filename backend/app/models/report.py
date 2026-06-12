from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, ForeignKey, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.base import Base
import enum


class ReportStatus(str, enum.Enum):
    pending = "pending"
    reviewed = "reviewed"
    resolved = "resolved"
    dismissed = "dismissed"


class Report(Base):
    __tablename__ = "reports"

    id = Column(Integer, primary_key=True, index=True)
    reporter_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    entity_type = Column(String(50))
    entity_id = Column(Integer)
    reason = Column(String(200))
    description = Column(Text)
    status = Column(Enum(ReportStatus), default=ReportStatus.pending)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    reporter = relationship("User", foreign_keys=[reporter_id], back_populates="reports")
