import numpy as np
import pandas as pd
from scipy import stats

def safe_float(value):
    try:
        v = float(value)
        if np.isnan(v) or np.isinf(v):
            return None
        return round(v, 4)
    except:
        return None

def compute_iqr_bounds(series: pd.Series):
    q1 = series.quantile(0.25)
    q3 = series.quantile(0.75)
    iqr = q3 - q1
    lower = q1 - 1.5 * iqr
    upper = q3 + 1.5 * iqr
    return lower, upper

def compute_zscore_outliers(series: pd.Series, threshold: float = 3.0):
    clean = series.dropna()
    if len(clean) < 10:
        return []
    z = np.abs(stats.zscore(clean))
    outlier_idx = clean.index[z > threshold].tolist()
    return outlier_idx

def normalize_score(value: float, min_val: float = 0.0, max_val: float = 1.0) -> float:
    return max(min_val, min(max_val, value))
