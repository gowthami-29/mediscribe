from fastapi import APIRouter, UploadFile, File
from sqlalchemy.orm import Session
from uuid import UUID

from app.services.radiology_service import (
    analyze_xray_image,
    generate_embedding
)

from app.models.radiology import RadiologyReport
from app.db.session import SessionLocal

router = APIRouter()


@router.post("/analyze-xray")
async def analyze_xray(
    patient_id: UUID,
    file: UploadFile = File(...)
):

    db: Session = SessionLocal()

    image_bytes = await file.read()

    # Fetch previous reports
    previous_reports = (
        db.query(RadiologyReport)
        .filter(RadiologyReport.patient_id == patient_id)
        .all()
    )

    # Build history text
    history_text = ""

    for old_report in previous_reports:
        history_text += f"""
        Findings: {old_report.findings}

        Impression: {old_report.impression}
        """

    # Generate AI report
    report = await analyze_xray_image(
        image_bytes,
        history_text
    )

    # Generate embedding
    embedding = await generate_embedding(
        report["findings"]
    )

    # Save report
    db_report = RadiologyReport(
        patient_id=patient_id,
        findings=report["findings"],
        impression=report["impression"],
        abnormalities=", ".join(report["abnormalities"]),
        comparison=report["comparison"],
        embedding=embedding
    )

    db.add(db_report)
    db.commit()
    db.refresh(db_report)

    db.close()

    return {
        "success": True,
        "patient_id": str(patient_id),
        "report_id": str(db_report.id),
        "previous_reports_count": len(previous_reports),
        "report": report
    }

@router.get("/similar-reports")
async def get_similar_reports(query: str):

    db: Session = SessionLocal()

    # Generate embedding for search query
    query_embedding = await generate_embedding(query)

    # Find similar reports using pgvector cosine similarity
    results = (
        db.query(RadiologyReport)
        .order_by(
            RadiologyReport.embedding.cosine_distance(
                query_embedding
            )
        )
        .limit(5)
        .all()
    )

    db.close()

    return {
        "query": query,
        "matches": [
            {
                "patient_id": str(report.patient_id),
                "findings": report.findings,
                "impression": report.impression,
                "comparison": report.comparison
            }
            for report in results
        ]
    }