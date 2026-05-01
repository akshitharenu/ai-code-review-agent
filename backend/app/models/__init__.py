from sqlalchemy import Column, String, Integer, Float, DateTime, Text, JSON
from sqlalchemy.dialects.postgresql import UUID
from app.database import Base
from datetime import datetime
import uuid

class CodeReview(Base):
    __tablename__ = "code_reviews"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    filename = Column(String, nullable=True)
    language = Column(String, nullable=True)
    code = Column(Text, nullable=False)
    status = Column(String, default="pending")

    # Node outputs
    parsed_code = Column(Text, nullable=True)
    bugs = Column(JSON, nullable=True)
    security_issues = Column(JSON, nullable=True)
    quality_score = Column(Integer, nullable=True)
    quality_feedback = Column(Text, nullable=True)
    suggestions = Column(JSON, nullable=True)
    final_report = Column(Text, nullable=True)

    # Stats
    total_bugs = Column(Integer, default=0)
    critical_bugs = Column(Integer, default=0)
    total_security = Column(Integer, default=0)
    critical_security = Column(Integer, default=0)

    created_at = Column(DateTime, default=datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)