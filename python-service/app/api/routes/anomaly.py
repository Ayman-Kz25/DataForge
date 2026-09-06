from fastapi import APIRouter, HTTPException
from app.models.schemas import DatasetInput
from app.services.anomaly_detector import detect_anomalies
from app.utils.file_handler import load_dataframe_from_url
from app.core.logger import logger

router = APIRouter()

@router.post("/anomalies")
async def anomaly_endpoint(payload: DatasetInput):
    try:
        df = load_dataframe_from_url(payload.cloudinaryUrl, payload.fileType)
        return detect_anomalies(df)
    except Exception as e:
        logger.error(f"Anomaly detection error: {e}")
        raise HTTPException(status_code=500, detail="Anomaly detection failed.")
