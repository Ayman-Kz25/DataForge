import numpy as np
import pandas as pd
from sklearn.ensemble import IsolationForest
from sklearn.preprocessing import StandardScaler
from app.utils.stat_helpers import safe_float
from app.core.logger import logger

def detect_anomalies(df: pd.DataFrame) -> dict:
    logger.info("Running Isolation Forest anomaly detection")
    numeric_df = df.select_dtypes(include=[np.number]).copy()
    numeric_df = numeric_df.loc[:, numeric_df.isnull().mean() < 0.5]
    
    if numeric_df.empty or numeric_df.shape[1] == 0:
        return {
            "method": "Isolation Forest",
            "status": "skipped",
            "reason": "No numeric columns with sufficient data",
            "anomalyCount": 0,
            "anomalyPercentage": 0.0,
            "contamination": 0.0,
            "affectedRows": [],
            "normalizedScores": [],
            "columnScores": {},
        }
    
    numeric_filled = numeric_df.fillna(numeric_df.median())
    
    if len(numeric_filled) < 10:
        return {
            "method": "Isolation Forest",
            "status": "skipped",
            "reason": "Insufficient rows (< 10)",
            "anomalyCount": 0,
            "anomalyPercentage": 0.0,
            "contamination": 0.0,
            "affectedRows": [],
            "normalizedScores": [],
            "columnScores": {},
        }
    
    scaler = StandardScaler()
    scaled = scaler.fit_transform(numeric_filled)
    
    model = IsolationForest(
        contamination='auto',
        random_state=42,
        n_estimators=100,
        n_jobs=-1,
    )
    predictions = model.fit_predict(scaled)
    scores = model.decision_function(scaled)
    
    anomaly_mask = predictions == -1
    anomaly_indices = np.where(anomaly_mask)[0].tolist()
    anomaly_count = int(anomaly_mask.sum())
    anomaly_pct = safe_float(anomaly_count / max(len(df), 1) * 100)
    contamination = safe_float(anomaly_count / max(len(df), 1))
    
    min_score, max_score = scores.min(), scores.max()
    if max_score != min_score:
        normalized = ((scores - max_score) / (min_score - max_score)).clip(0, 1)
    else:
        normalized = np.zeros_like(scores)
    
    column_scores = {}
    for col in numeric_filled.columns:
        if anomaly_mask.sum() > 0:
            anomaly_mean = numeric_filled[col][anomaly_mask].mean()
            normal_mean = numeric_filled[col][~anomaly_mask].mean()
            diff = abs(anomaly_mean - normal_mean)
            column_scores[str(col)] = safe_float(diff)
    
    return {
        "method": "Isolation Forest",
        "status": "completed",
        "anomalyCount": anomaly_count,
        "anomalyPercentage": anomaly_pct,
        "contamination": contamination,
        "affectedRows": anomaly_indices[:500],
        "normalizedScores": [safe_float(s) for s in normalized.tolist()[:1000]],
        "columnScores": column_scores,
        "numericColumnsUsed": [str(c) for c in numeric_filled.columns],
    }
