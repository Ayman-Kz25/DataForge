from fastapi import APIRouter, HTTPException
from fastapi.responses import Response
from app.models.schemas import ReportInput
from app.services import report_generator
from app.core.logger import logger

router = APIRouter()

@router.post("/reports/pdf")
async def generate_pdf_report(payload: ReportInput):
    try:
        pdf_bytes = report_generator.generate_pdf(payload.model_dump())
        return Response(
            content=pdf_bytes,
            media_type="application/pdf",
            headers={"Content-Disposition": "attachment; filename=dataforge_report.pdf"}
        )
    except Exception as e:
        logger.error(f"PDF generation error: {e}")
        raise HTTPException(status_code=500, detail="PDF report generation failed.")
