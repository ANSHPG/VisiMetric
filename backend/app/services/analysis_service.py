import json
import hashlib
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.analysis import AnalysisResult
from app.services.cv_pipeline import extract_features
from app.services.ml_engine import predict_quality
from app.config import settings

async def analyze_and_store(filename: str, file_bytes: bytes, db: AsyncSession):
    file_hash = hashlib.sha256(file_bytes).hexdigest()
    
    features = extract_features(file_bytes)
    prediction = predict_quality(features, file_bytes)
    
    db_record = AnalysisResult(
        filename=filename,
        file_hash=file_hash,
        quality_score=prediction["quality_score"],
        quality_label=prediction["quality_label"],
        issues_json=json.dumps(prediction["issues"]),
        feature_stats_json=json.dumps(features),
        model_version=settings.model_version
    )
    
    db.add(db_record)
    await db.commit()
    await db.refresh(db_record)
    
    return {
        "id": db_record.id,
        "filename": db_record.filename,
        "quality_score": db_record.quality_score,
        "quality_label": db_record.quality_label,
        "issues": prediction["issues"],
        "feature_stats": features,
        "gradcam_url": None,
        "analyzed_at": db_record.analyzed_at
    }
