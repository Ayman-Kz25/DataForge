import pandas as pd
import numpy as np
from app.utils.stat_helpers import safe_float
from app.core.logger import logger

def auto_clean(df: pd.DataFrame) -> dict:
    df_clean = df.copy()
    operations = []
    step = 1
    
    # 1. Remove empty columns
    empty_cols = [str(col) for col in df_clean.columns if df_clean[col].isnull().all()]
    if empty_cols:
        df_clean.drop(columns=empty_cols, inplace=True)
        operations.append({
            "step": step, "type": "other",
            "column": ", ".join(empty_cols),
            "strategy": "drop_column",
            "rowsBefore": len(df_clean), "rowsAfter": len(df_clean),
            "changeCount": len(empty_cols),
            "description": f"Removed {len(empty_cols)} completely empty column(s)"
        })
        step += 1
    
    # 2. Remove duplicate rows
    dup_count = int(df_clean.duplicated().sum())
    if dup_count > 0:
        rows_before = len(df_clean)
        df_clean.drop_duplicates(inplace=True)
        df_clean.reset_index(drop=True, inplace=True)
        operations.append({
            "step": step, "type": "duplicates",
            "column": None,
            "strategy": "drop_first_occurrence_kept",
            "rowsBefore": rows_before, "rowsAfter": len(df_clean),
            "changeCount": dup_count,
            "description": f"Removed {dup_count} duplicate row(s)"
        })
        step += 1
    
    # 3. Fix data types
    for col in df_clean.columns:
        if df_clean[col].dtype == object:
            try:
                converted = pd.to_numeric(df_clean[col], errors='coerce')
                new_nulls = converted.isnull().sum()
                orig_nulls = df_clean[col].isnull().sum()
                if (new_nulls - orig_nulls) / max(len(df_clean), 1) < 0.05:
                    df_clean[col] = converted
                    operations.append({
                        "step": step, "type": "type_fix",
                        "column": str(col), "strategy": "cast_to_numeric",
                        "rowsBefore": len(df_clean), "rowsAfter": len(df_clean),
                        "changeCount": 1,
                        "description": f"Converted '{col}' to numeric type"
                    })
                    step += 1
            except:
                pass
    
    # 4. Fill missing values
    for col in df_clean.columns:
        missing = df_clean[col].isnull().sum()
        if missing == 0:
            continue
        if pd.api.types.is_numeric_dtype(df_clean[col]):
            fill_val = df_clean[col].median()
            df_clean[col].fillna(fill_val, inplace=True)
            operations.append({
                "step": step, "type": "missing_values",
                "column": str(col), "strategy": "median_fill",
                "rowsBefore": len(df_clean), "rowsAfter": len(df_clean),
                "changeCount": int(missing),
                "description": f"Filled {missing} missing value(s) in '{col}' with median ({safe_float(fill_val)})"
            })
        else:
            mode_val = df_clean[col].mode()
            if len(mode_val) > 0:
                df_clean[col].fillna(mode_val[0], inplace=True)
                operations.append({
                    "step": step, "type": "missing_values",
                    "column": str(col), "strategy": "mode_fill",
                    "rowsBefore": len(df_clean), "rowsAfter": len(df_clean),
                    "changeCount": int(missing),
                    "description": f"Filled {missing} missing value(s) in '{col}' with mode ('{mode_val[0]}')"
                })
        step += 1
    
    # 5. String formatting
    for col in df_clean.select_dtypes(include=['object']).columns:
        if df_clean[col].nunique() <= 30:
            orig = df_clean[col].copy()
            df_clean[col] = df_clean[col].astype(str).str.strip().str.title()
            changed = int((df_clean[col] != orig.astype(str)).sum())
            if changed > 0:
                operations.append({
                    "step": step, "type": "format_fix",
                    "column": str(col), "strategy": "strip_title_case",
                    "rowsBefore": len(df_clean), "rowsAfter": len(df_clean),
                    "changeCount": changed,
                    "description": f"Standardized {changed} value(s) in '{col}'"
                })
                step += 1
    
    # 6. Winsorize extreme outliers
    for col in df_clean.select_dtypes(include=[np.number]).columns:
        clean_col = df_clean[col].dropna()
        mean, std = clean_col.mean(), clean_col.std()
        if std == 0 or np.isnan(std):
            continue
        lower, upper = mean - 3 * std, mean + 3 * std
        before = df_clean[col].copy()
        df_clean[col] = df_clean[col].clip(lower=lower, upper=upper)
        changed = int((df_clean[col] != before).sum())
        if changed > 0:
            operations.append({
                "step": step, "type": "outliers",
                "column": str(col), "strategy": "winsorize_3sigma",
                "rowsBefore": len(df_clean), "rowsAfter": len(df_clean),
                "changeCount": changed,
                "description": f"Capped {changed} outlier(s) in '{col}' to 3-sigma bounds"
            })
            step += 1
            
    return {
        "cleanedDf": df_clean,
        "operations": operations,
        "rowsBefore": len(df),
        "rowsAfter": len(df_clean),
    }
