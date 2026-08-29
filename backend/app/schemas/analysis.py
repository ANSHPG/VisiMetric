from pydantic import BaseModel
from typing import List, Dict, Optional
from datetime import datetime

class Issue(BaseModel):
    type: str
    severity: str
    confidence: float

class AnalysisResponse(BaseModel):
    id: str
    filename: str
    quality_score: float
    quality_label: str
    issues: List[Issue]
    feature_stats: Dict[str, float]
    gradcam_url: Optional[str] = None
    analyzed_at: datetime

    class Config:
        from_attributes = True
