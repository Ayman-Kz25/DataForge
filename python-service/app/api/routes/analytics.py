from fastapi import APIRouter, HTTPException
from app.models.schemas import AnalyticsInput
from app.utils.file_handler import load_dataframe_from_url
from app.utils.type_detector import detect_column_semantic_type
from app.utils.stat_helpers import safe_float
from app.core.logger import logger
import pandas as pd
import numpy as np

router = APIRouter()

@router.post("/analytics")
async def analytics_endpoint(payload: AnalyticsInput):
    try:
        df = load_dataframe_from_url(payload.cloudinaryUrl, payload.fileType)
        charts = generate_chart_data(df)
        return {"charts": charts}
    except Exception as e:
        logger.error(f"Analytics error: {e}")
        raise HTTPException(status_code=500, detail="Analytics generation failed.")

def generate_chart_data(df: pd.DataFrame) -> list:
    charts = []
    
    for col in df.columns:
        series = df[col].dropna()
        sem_type = detect_column_semantic_type(df[col])
        
        if sem_type == 'numeric' and len(series) > 0:
            counts, edges = np.histogram(series, bins=min(20, max(series.nunique(), 2)))
            charts.append({
                "id": f"hist_{col}",
                "type": "histogram",
                "column": str(col),
                "title": f"Distribution of {col}",
                "data": {
                    "bins": [safe_float(e) for e in edges[:-1]],
                    "counts": counts.tolist(),
                }
            })
            charts.append({
                "id": f"box_{col}",
                "type": "boxplot",
                "column": str(col),
                "title": f"Box Plot: {col}",
                "data": {
                    "min": safe_float(series.min()),
                    "q1": safe_float(series.quantile(0.25)),
                    "median": safe_float(series.median()),
                    "q3": safe_float(series.quantile(0.75)),
                    "max": safe_float(series.max()),
                }
            })
        elif sem_type == 'categorical' and series.nunique() <= 30:
            vc = series.value_counts().head(15)
            chart_type = "donut" if series.nunique() <= 6 else "bar"
            charts.append({
                "id": f"cat_{col}",
                "type": chart_type,
                "column": str(col),
                "title": f"Distribution of {col}",
                "data": {
                    "labels": [str(k) for k in vc.index],
                    "values": vc.values.tolist(),
                }
            })
    
    numeric_cols = df.select_dtypes(include=[np.number]).columns.tolist()
    if len(numeric_cols) > 1:
        corr = df[numeric_cols].corr().fillna(0)
        charts.append({
            "id": "correlation_heatmap",
            "type": "heatmap",
            "title": "Correlation Heatmap",
            "data": {
                "columns": [str(c) for c in numeric_cols],
                "matrix": [[safe_float(corr.iloc[i, j]) for j in range(len(numeric_cols))] for i in range(len(numeric_cols))]
            }
        })
    
    missing = df.isnull().sum()
    missing = missing[missing > 0]
    if len(missing) > 0:
        charts.append({
            "id": "missing_values_chart",
            "type": "bar",
            "title": "Missing Values by Column",
            "data": {
                "labels": [str(k) for k in missing.index],
                "values": missing.values.tolist(),
            }
        })
    
    return charts
