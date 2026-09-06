from pydantic import BaseModel
from typing import Optional, List, Dict, Any

class DatasetInput(BaseModel):
    cloudinaryUrl: str
    fileType: str

class CleaningOptions(BaseModel):
    mode: str
    missingNumericStrategy: Optional[str] = 'median'
    missingCatStrategy: Optional[str] = 'mode'
    handleDuplicates: Optional[bool] = True
    handleOutliers: Optional[bool] = True
    outlierStrategy: Optional[str] = 'winsorize'
    handleFormats: Optional[bool] = True

class CleaningInput(BaseModel):
    cloudinaryUrl: str
    fileType: str
    options: CleaningOptions

class AnalyticsInput(BaseModel):
    cloudinaryUrl: str
    fileType: str
    cleanedUrl: Optional[str] = None

class ReportInput(BaseModel):
    dataset: Dict[str, Any]
    processingResult: Dict[str, Any]
    cleaningHistory: Optional[Dict[str, Any]] = None
    userName: Optional[str] = "DataForge User"
