from fastapi import APIRouter, UploadFile, File, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app.services.analysis_service import analyze_and_store
from app.schemas.analysis import AnalysisResponse

router = APIRouter()

@router.post("/analyze", response_model=AnalysisResponse)
async def analyze_image(file: UploadFile = File(...), db: AsyncSession = Depends(get_db)):
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image")
        
    file_bytes = await file.read()
    result = await analyze_and_store(file.filename, file_bytes, db)
    return result
