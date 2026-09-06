from fastapi import APIRouter, HTTPException
from app.models.schemas import CleaningInput
from app.services.cleaner import auto_clean
from app.utils.file_handler import load_dataframe_from_url, dataframe_to_excel_bytes
from app.core.logger import logger
import base64

router = APIRouter()

@router.post("/clean")
async def clean_endpoint(payload: CleaningInput):
    try:
        df = load_dataframe_from_url(payload.cloudinaryUrl, payload.fileType)
        result = auto_clean(df)
        cleaned_df = result["cleanedDf"]
        excel_bytes = dataframe_to_excel_bytes(cleaned_df, result["operations"])
        excel_b64 = base64.b64encode(excel_bytes).decode('utf-8')
        
        return {
            "operations": result["operations"],
            "rowsBefore": result["rowsBefore"],
            "rowsAfter": result["rowsAfter"],
            "cleanedFileB64": excel_b64,
            "previewRows": cleaned_df.head(50).fillna("").to_dict(orient='records'),
        }
    except Exception as e:
        logger.error(f"Cleaning error: {e}")
        raise HTTPException(status_code=500, detail="Cleaning failed.")
