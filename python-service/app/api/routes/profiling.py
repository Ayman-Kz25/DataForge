from fastapi import APIRouter, HTTPException
from app.models.schemas import DatasetInput
from app.services.profiler import profile_dataset
from app.utils.file_handler import load_dataframe_from_url
from app.core.logger import logger

router = APIRouter()

@router.post("/profile")
async def profile_endpoint(payload: DatasetInput):
    try:
        df = load_dataframe_from_url(payload.cloudinaryUrl, payload.fileType)
        result = profile_dataset(
            df)
        return result
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Profiling error: {e}")
        raise HTTPException(status_code=500, detail="Profiling failed. Please check the file format.")
