import pandas as pd
import requests
import io
from app.core.logger import logger

def load_dataframe_from_url(url: str, file_type: str) -> pd.DataFrame:
    logger.info(f"Downloading file from URL: {url[:60]}...")
    response = requests.get(url, timeout=60)
    response.raise_for_status()
    content = io.BytesIO(response.content)
    
    if file_type == 'csv':
        for encoding in ['utf-8', 'latin-1', 'cp1252']:
            try:
                content.seek(0)
                df = pd.read_csv(content, encoding=encoding, low_memory=False)
                logger.info(f"Loaded CSV with {len(df)} rows and {len(df.columns)} columns")
                return df
            except UnicodeDecodeError:
                continue
        raise ValueError("Could not decode CSV file. Please ensure UTF-8 or Latin-1 encoding.")
    elif file_type == 'xlsx':
        df = pd.read_excel(content, engine='openpyxl')
        logger.info(f"Loaded Excel with {len(df)} rows and {len(df.columns)} columns")
        return df
    else:
        raise ValueError(f"Unsupported file type: {file_type}")

def dataframe_to_excel_bytes(df: pd.DataFrame, change_log: list = None) -> bytes:
    output = io.BytesIO()
    with pd.ExcelWriter(output, engine='openpyxl') as writer:
        df.to_excel(writer, sheet_name='Cleaned Data', index=False)
        if change_log:
            log_df = pd.DataFrame(change_log)
            log_df.to_excel(writer, sheet_name='Cleaning Log', index=False)
    return output.getvalue()
