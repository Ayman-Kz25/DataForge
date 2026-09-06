from fastapi import APIRouter, HTTPException
from app.models.schemas import DatasetInput
from app.services.validator import run_all_checks
from app.services.anomaly_detector import detect_anomalies
from app.services.scorer import calculate_quality_score
from app.utils.file_handler import load_dataframe_from_url
from app.core.logger import logger

router = APIRouter()

@router.post("/validate")
async def validate_endpoint(payload: DatasetInput):
    try:
        df = load_dataframe_from_url(payload.cloudinaryUrl, payload.fileType)
        validation_result = run_all_checks(df)
        anomaly_result = detect_anomalies(df)
        contamination = anomaly_result.get("contamination", 0.0) or 0.0
        quality_score = calculate_quality_score(
            df,
            validation_result["checks"],
            contamination
        )
        return {
            "validationResult": validation_result,
            "qualityScore": quality_score,
            "anomalyResult": anomaly_result,
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Validation error: {e}")
        raise HTTPException(status_code=500, detail="Validation failed. Please check the file format.")
