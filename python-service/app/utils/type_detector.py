import pandas as pd

def detect_column_semantic_type(series: pd.Series) -> str:
    col_name = str(series.name).lower() if series.name else ''
    sample = series.dropna().head(100)
    
    if pd.api.types.is_bool_dtype(series):
        return 'boolean'
    
    if pd.api.types.is_numeric_dtype(series):
        unique_ratio = series.nunique() / max(len(series), 1)
        if unique_ratio > 0.9 and 'id' in col_name:
            return 'id'
        return 'numeric'
    
    if pd.api.types.is_datetime64_any_dtype(series):
        return 'datetime'
    
    if len(sample) > 0:
        try:
            pd.to_datetime(sample.astype(str).head(20))
            return 'datetime'
        except:
            pass
    
    unique_ratio = series.nunique() / max(len(series.dropna()), 1)
    avg_len = sample.astype(str).str.len().mean() if len(sample) > 0 else 0
    
    if unique_ratio < 0.1 or series.nunique() <= 20:
        return 'categorical'
    
    if avg_len > 50:
        return 'text'
    
    return 'categorical'
