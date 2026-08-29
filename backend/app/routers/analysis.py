from fastapi import APIRouter, UploadFile, File, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import desc
from typing import List
from app.database import get_db
from app.services.analysis_service import analyze_and_store
from app.schemas.analysis import AnalysisResponse
from app.models.analysis import AnalysisResult
import json

router = APIRouter()

@router.post("/analyze", response_model=AnalysisResponse)
async def analyze_image(file: UploadFile = File(...), db: AsyncSession = Depends(get_db)):
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image")
        
    file_bytes = await file.read()
    result = await analyze_and_store(file.filename, file_bytes, db)
    return result

@router.get("/analyses", response_model=List[AnalysisResponse])
async def get_all_analyses(db: AsyncSession = Depends(get_db)):
    query = select(AnalysisResult).order_by(desc(AnalysisResult.analyzed_at))
    result = await db.execute(query)
    records = result.scalars().all()
    return [
        {
            "id": r.id,
            "filename": r.filename,
            "quality_score": r.quality_score,
            "quality_label": r.quality_label,
            "issues": json.loads(r.issues_json),
            "feature_stats": json.loads(r.feature_stats_json),
            "gradcam_url": r.gradcam_path,
            "analyzed_at": r.analyzed_at
        }
        for r in records
    ]

@router.get("/analyses/{analysis_id}", response_model=AnalysisResponse)
async def get_analysis(analysis_id: str, db: AsyncSession = Depends(get_db)):
    query = select(AnalysisResult).where(AnalysisResult.id == analysis_id)
    result = await db.execute(query)
    record = result.scalar_one_or_none()
    
    if not record:
        raise HTTPException(status_code=404, detail="Analysis not found")
        
    return {
        "id": record.id,
        "filename": record.filename,
        "quality_score": record.quality_score,
        "quality_label": record.quality_label,
        "issues": json.loads(record.issues_json),
        "feature_stats": json.loads(record.feature_stats_json),
        "gradcam_url": record.gradcam_path,
        "analyzed_at": record.analyzed_at
    }
