import pandas as pd
import numpy as np
from app.utils.type_detector import detect_column_semantic_type
from app.utils.stat_helpers import safe_float
from app.core.logger import logger
from scipy import stats

def profile_dataset(df: pd.DataFrame) -> dict:
    logger.info(f"Profiling dataset: {df.shape[0]} rows x {df.shape[1]} columns")
    columns_profile = []
    
    for col in df.columns:
        series = df[col]
        semantic_type = detect_column_semantic_type(series)
        
        col_info = {
            "name": str(col),
            "dtype": str(series.dtype),
            "semanticType": semantic_type,
            "totalCount": int(len(series)),
            "missingCount": int(series.isnull().sum()),
            "missingPercentage": safe_float(series.isnull().mean() * 100),
            "uniqueCount": int(series.nunique()),
            "uniquePercentage": safe_float(series.nunique() / max(len(series), 1) * 100),
            "sampleValues": series.dropna().head(5).astype(str).tolist(),
        }
        
        if pd.api.types.is_numeric_dtype(series) and semantic_type in ('numeric', 'id'):
            clean = series.dropna()
            if len(clean) > 0:
                col_info.update({
                    "min": safe_float(clean.min()),
                    "max": safe_float(clean.max()),
                    "mean": safe_float(clean.mean()),
                    "median": safe_float(clean.median()),
                    "std": safe_float(clean.std()),
                    "q1": safe_float(clean.quantile(0.25)),
                    "q3": safe_float(clean.quantile(0.75)),
                    "skewness": safe_float(stats.skew(clean)),
                    "kurtosis": safe_float(stats.kurtosis(clean)),
                })
        
        if semantic_type == 'categorical':
            value_counts = series.value_counts().head(10)
            col_info["categories"] = series.dropna().unique().astype(str).tolist()[:20]
            col_info["topCategories"] = {str(k): int(v) for k, v in value_counts.items()}
        
        columns_profile.append(col_info)
    
    memory_mb = safe_float(df.memory_usage(deep=True).sum() / (1024 * 1024))

    # Dataset-level missing percentage (any cell missing / total cells)
    total_cells = df.shape[0] * df.shape[1]
    total_missing = int(df.isnull().sum().sum())
    missing_pct = safe_float((total_missing / total_cells * 100) if total_cells > 0 else 0)

    # Duplicate rows
    duplicate_rows = int(df.duplicated().sum())

    dtype_counts = {}
    for col in df.columns:
        t = detect_column_semantic_type(df[col])
        dtype_counts[t] = dtype_counts.get(t, 0) + 1

    return {
        "rowCount": int(df.shape[0]),
        "columnCount": int(df.shape[1]),
        "memoryUsageMB": memory_mb,
        "missingPercentage": missing_pct,
        "duplicateRows": duplicate_rows,
        "columnNames": [str(c) for c in df.columns],
        "dtypeCounts": dtype_counts,
        "columns": columns_profile,
    }
