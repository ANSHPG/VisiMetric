from sqlalchemy import Column, String, Float, DateTime
from app.database import Base
import datetime
import uuid

class AnalysisResult(Base):
    __tablename__ = "analysis_results"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    filename = Column(String, nullable=False)
    file_hash = Column(String, nullable=False)
    quality_score = Column(Float, nullable=False)
    quality_label = Column(String, nullable=False)
    issues_json = Column(String, nullable=False)
    feature_stats_json = Column(String, nullable=False)
    gradcam_path = Column(String, nullable=True)
    model_version = Column(String, nullable=False)
    analyzed_at = Column(DateTime, default=datetime.datetime.utcnow)
