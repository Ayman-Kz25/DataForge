import pandas as pd
import numpy as np
from scipy import stats
from app.utils.stat_helpers import safe_float, compute_iqr_bounds, compute_zscore_outliers
from app.core.logger import logger

def run_all_checks(df: pd.DataFrame) -> dict:
    logger.info(f"Running 14 validation checks on {df.shape} dataset")
    checks = []
    
    # 1. Missing Values
    missing_per_col = df.isnull().sum()
    total_missing = int(missing_per_col.sum())
    missing_pct = safe_float(total_missing / max(df.size, 1) * 100)
    affected_cols = missing_per_col[missing_per_col > 0].to_dict()
    checks.append({
        "id": "missing_values",
        "name": "Missing Values",
        "status": "pass" if total_missing == 0 else ("warning" if missing_pct < 5 else "fail"),
        "severity": "high",
        "summary": f"{total_missing} missing values ({missing_pct}%) across {len(affected_cols)} column(s)" if total_missing > 0 else "No missing values found",
        "details": {
            "totalMissing": total_missing,
            "missingPercentage": missing_pct,
            "affectedColumns": {str(k): int(v) for k, v in affected_cols.items()},
        }
    })
    
    # 2. Duplicate Rows
    dup_count = int(df.duplicated().sum())
    dup_pct = safe_float(dup_count / max(len(df), 1) * 100)
    checks.append({
        "id": "duplicate_rows",
        "name": "Duplicate Rows",
        "status": "pass" if dup_count == 0 else ("warning" if dup_pct < 2 else "fail"),
        "severity": "high",
        "summary": f"{dup_count} duplicate row(s) found ({dup_pct}%)" if dup_count > 0 else "No duplicate rows found",
        "details": {"duplicateCount": dup_count, "duplicatePercentage": dup_pct}
    })
    
    # 3. Duplicate Columns
    dup_cols = []
    cols = df.columns.tolist()
    for i in range(len(cols)):
        for j in range(i + 1, len(cols)):
            if df[cols[i]].equals(df[cols[j]]):
                dup_cols.append((str(cols[i]), str(cols[j])))
    checks.append({
        "id": "duplicate_columns",
        "name": "Duplicate Columns",
        "status": "pass" if not dup_cols else "warning",
        "severity": "medium",
        "summary": f"{len(dup_cols)} duplicate column pair(s) found" if dup_cols else "No duplicate columns found",
        "details": {"duplicatePairs": dup_cols}
    })
    
    # 4. Incorrect Data Types
    type_issues = []
    for col in df.columns:
        series = df[col]
        if series.dtype == object:
            sample = series.dropna().head(50)
            try:
                pd.to_numeric(sample)
                type_issues.append({"column": str(col), "currentType": "string", "suggestedType": "numeric"})
            except:
                pass
    checks.append({
        "id": "incorrect_dtypes",
        "name": "Incorrect Data Types",
        "status": "pass" if not type_issues else "warning",
        "severity": "medium",
        "summary": f"{len(type_issues)} column(s) may have incorrect data types" if type_issues else "All data types appear correct",
        "details": {"issues": type_issues}
    })
    
    # 5. Empty Columns
    empty_cols = [str(col) for col in df.columns if df[col].isnull().all()]
    checks.append({
        "id": "empty_columns",
        "name": "Empty Columns",
        "status": "pass" if not empty_cols else "fail",
        "severity": "high",
        "summary": f"{len(empty_cols)} completely empty column(s) found" if empty_cols else "No empty columns found",
        "details": {"emptyColumns": empty_cols}
    })
    
    # 6. Constant Columns
    constant_cols = [str(col) for col in df.columns if df[col].nunique() == 1]
    checks.append({
        "id": "constant_columns",
        "name": "Constant Columns",
        "status": "pass" if not constant_cols else "warning",
        "severity": "low",
        "summary": f"{len(constant_cols)} constant column(s)" if constant_cols else "No constant columns found",
        "details": {"constantColumns": constant_cols}
    })
    
    # 7. Zero-Variance Columns
    numeric_cols = df.select_dtypes(include=[np.number]).columns
    zero_var = [str(col) for col in numeric_cols if df[col].std() == 0]
    checks.append({
        "id": "zero_variance",
        "name": "Zero-Variance Columns",
        "status": "pass" if not zero_var else "warning",
        "severity": "low",
        "summary": f"{len(zero_var)} numeric column(s) with zero variance" if zero_var else "All numeric columns have variance",
        "details": {"zeroVarianceColumns": zero_var}
    })
    
    # 8. Outliers (IQR)
    iqr_outliers = {}
    for col in numeric_cols:
        clean = df[col].dropna()
        if len(clean) < 10:
            continue
        lower, upper = compute_iqr_bounds(clean)
        outlier_mask = (clean < lower) | (clean > upper)
        count = int(outlier_mask.sum())
        if count > 0:
            iqr_outliers[str(col)] = {"count": count, "lowerBound": safe_float(lower), "upperBound": safe_float(upper)}
    total_iqr = sum(v["count"] for v in iqr_outliers.values())
    checks.append({
        "id": "outliers_iqr",
        "name": "Outliers (IQR Method)",
        "status": "pass" if not iqr_outliers else "warning",
        "severity": "medium",
        "summary": f"{total_iqr} outlier(s) detected across {len(iqr_outliers)} column(s)" if iqr_outliers else "No IQR outliers detected",
        "details": {"outliersByColumn": iqr_outliers}
    })
    
    # 9. Outliers (Z-Score)
    zscore_outliers = {}
    for col in numeric_cols:
        clean = df[col].dropna()
        outlier_idx = compute_zscore_outliers(clean)
        if outlier_idx:
            zscore_outliers[str(col)] = {"count": len(outlier_idx)}
    total_zscore = sum(v["count"] for v in zscore_outliers.values())
    checks.append({
        "id": "outliers_zscore",
        "name": "Outliers (Z-Score Method)",
        "status": "pass" if not zscore_outliers else "warning",
        "severity": "medium",
        "summary": f"{total_zscore} outlier(s) detected by Z-Score across {len(zscore_outliers)} column(s)" if zscore_outliers else "No Z-Score outliers detected",
        "details": {"outliersByColumn": zscore_outliers}
    })
    
    # 10. Invalid Value Ranges
    range_issues = []
    for col in df.columns:
        col_lower = str(col).lower()
        series = df[col].dropna()
        if pd.api.types.is_numeric_dtype(series):
            if any(x in col_lower for x in ['age', 'year']):
                neg_count = int((series < 0).sum())
                extreme_count = int((series > 150).sum()) if 'age' in col_lower else 0
                if neg_count > 0:
                    range_issues.append({"column": str(col), "issue": f"{neg_count} negative value(s)"})
                if extreme_count > 0:
                    range_issues.append({"column": str(col), "issue": f"{extreme_count} unrealistic value(s) > 150"})
            if any(x in col_lower for x in ['salary', 'price', 'cost', 'revenue', 'amount']):
                neg_count = int((series < 0).sum())
                if neg_count > 0:
                    range_issues.append({"column": str(col), "issue": f"{neg_count} negative value(s) in '{col}'"})
    checks.append({
        "id": "invalid_ranges",
        "name": "Invalid Value Ranges",
        "status": "pass" if not range_issues else "fail",
        "severity": "high",
        "summary": f"{len(range_issues)} invalid range issue(s) found" if range_issues else "No invalid ranges detected",
        "details": {"issues": range_issues}
    })
    
    # 11. Format Inconsistency
    format_issues = {}
    cat_cols = df.select_dtypes(include=['object']).columns
    for col in cat_cols:
        series = df[col].dropna()
        if series.nunique() > 30:
            continue
        unique_vals = series.unique().astype(str)
        normalized = set(v.strip().lower() for v in unique_vals)
        if len(normalized) < len(unique_vals):
            format_issues[str(col)] = {
                "uniqueRaw": int(len(unique_vals)),
                "uniqueNormalized": int(len(normalized)),
                "exampleValues": unique_vals[:6].tolist()
            }
    checks.append({
        "id": "format_inconsistency",
        "name": "Format Inconsistency",
        "status": "pass" if not format_issues else "warning",
        "severity": "medium",
        "summary": f"{len(format_issues)} column(s) have inconsistent formats" if format_issues else "No format inconsistencies found",
        "details": {"affectedColumns": format_issues}
    })
    
    # 12. Unexpected Categories
    rare_cats = {}
    for col in cat_cols:
        series = df[col].dropna()
        if series.nunique() > 50:
            continue
        value_counts = series.value_counts(normalize=True)
        rare = value_counts[value_counts < 0.005].index.tolist()
        if rare:
            rare_cats[str(col)] = {"rareCategories": [str(r) for r in rare]}
    checks.append({
        "id": "unexpected_categories",
        "name": "Unexpected Categories",
        "status": "pass" if not rare_cats else "info",
        "severity": "low",
        "summary": f"{len(rare_cats)} column(s) contain rare categories (<0.5%)" if rare_cats else "No unexpected categories found",
        "details": {"affectedColumns": rare_cats}
    })
    
    # 13. Distribution Skewness
    skewed_cols = {}
    for col in numeric_cols:
        clean = df[col].dropna()
        if len(clean) < 20:
            continue
        skew_val = stats.skew(clean)
        if abs(skew_val) > 2:
            skewed_cols[str(col)] = {"skewness": safe_float(skew_val), "direction": "right" if skew_val > 0 else "left"}
    checks.append({
        "id": "distribution_skewness",
        "name": "Distribution Skewness",
        "status": "pass" if not skewed_cols else "info",
        "severity": "low",
        "summary": f"{len(skewed_cols)} column(s) show high skewness (|skew| > 2)" if skewed_cols else "Distributions are symmetric",
        "details": {"skewedColumns": skewed_cols}
    })
    
    # 14. Correlation Analysis
    high_corr_pairs = []
    if len(numeric_cols) > 1:
        corr_matrix = df[numeric_cols].corr(method='pearson')
        for i in range(len(numeric_cols)):
            for j in range(i + 1, len(numeric_cols)):
                corr_val = corr_matrix.iloc[i, j]
                if abs(corr_val) > 0.9 and not np.isnan(corr_val):
                    high_corr_pairs.append({
                        "col1": str(numeric_cols[i]),
                        "col2": str(numeric_cols[j]),
                        "correlation": safe_float(corr_val)
                    })
    checks.append({
        "id": "correlation_analysis",
        "name": "High Correlation",
        "status": "pass" if not high_corr_pairs else "info",
        "severity": "low",
        "summary": f"{len(high_corr_pairs)} highly correlated column pair(s) found (r > 0.9)" if high_corr_pairs else "No high correlation anomalies",
        "details": {"highCorrelationPairs": high_corr_pairs}
    })
    
    total_issues = sum(1 for c in checks if c["status"] in ('warning', 'fail'))
    
    return {
        "checks": checks,
        "totalIssues": total_issues,
    }
