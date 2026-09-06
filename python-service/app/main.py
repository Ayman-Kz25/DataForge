from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.routes import profiling, validation, anomaly, cleaning, analytics, reports
from app.core.logger import logger

app = FastAPI(
    title="DataForge Processing Service",
    description="Python FastAPI service for data validation, cleaning, and analytics",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5000", "http://localhost:5173", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(profiling.router)
app.include_router(validation.router)
app.include_router(anomaly.router)
app.include_router(cleaning.router)
app.include_router(analytics.router)
app.include_router(reports.router)

@app.get("/health")
async def health_check():
    return {"status": "ok", "service": "DataForge Python Processing Service"}

logger.info("DataForge Python Service initialized")
