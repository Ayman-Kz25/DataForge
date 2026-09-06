from app.utils.stat_helpers import normalize_score, safe_float
from app.core.logger import logger

WEIGHTS = {
    "completeness": 0.25,
    "uniqueness": 0.20,
    "validity": 0.25,
    "consistency": 0.15,
    "anomalyScore": 0.15,
}

def calculate_quality_score(df, validation_checks: list, anomaly_contamination: float = 0.0) -> dict:
    checks_by_id = {c["id"]: c for c in validation_checks}
    
    total_cells = max(df.size, 1)
    missing_cells = df.isnull().sum().sum()
    completeness = normalize_score(1.0 - (missing_cells / total_cells))
    
    dup_count = df.duplicated().sum()
    uniqueness = normalize_score(1.0 - (dup_count / max(len(df), 1)))
    
    type_issues = len(checks_by_id.get("incorrect_dtypes", {}).get("details", {}).get("issues", []))
    range_issues = len(checks_by_id.get("invalid_ranges", {}).get("details", {}).get("issues", []))
    validity = normalize_score(1.0 - ((type_issues + range_issues) / total_cells))
    
    cat_cols = df.select_dtypes(include=['object']).shape[1]
    format_issues = len(checks_by_id.get("format_inconsistency", {}).get("details", {}).get("affectedColumns", {}))
    consistency = normalize_score(1.0 - (format_issues / max(cat_cols, 1)))
    
    anomaly_factor = normalize_score(1.0 - (anomaly_contamination or 0.0))
    
    overall = (
        WEIGHTS["completeness"] * completeness +
        WEIGHTS["uniqueness"] * uniqueness +
        WEIGHTS["validity"] * validity +
        WEIGHTS["consistency"] * consistency +
        WEIGHTS["anomalyScore"] * anomaly_factor
    ) * 100
    
    result = {
        "overall": safe_float(overall),
        "completeness": safe_float(completeness * 100),
        "uniqueness": safe_float(uniqueness * 100),
        "validity": safe_float(validity * 100),
        "consistency": safe_float(consistency * 100),
        "anomalyScore": safe_float(anomaly_factor * 100),
        "weights": WEIGHTS,
    }
    
    logger.info(f"Quality score calculated: {result['overall']}/100")
    return result
