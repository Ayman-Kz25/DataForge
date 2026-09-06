from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    python_env: str = "development"
    port: int = 8000
    max_file_size_mb: int = 50
    max_rows: int = 500000

    class Config:
        env_file = ".env"
        case_sensitive = False

settings = Settings()
