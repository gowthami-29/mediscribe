from fastapi import APIRouter, UploadFile, File
from sqlalchemy.orm import Session
from uuid import UUID

from app.services.radiology_service import (
    analyze_xray_image,
    generate_embedding
)

from app.services.storage_service import upload_image
from app.services.dicom_service import dicom_to_png_bytes

from app.models.radiology import RadiologyReport
from app.models.patient import Patient
from app.db.session import SessionLocal

router = APIRouter()


@router.post("/analyze-xray")
async def analyze_xray(
    patient_id: UUID,
    file: UploadFile = File(...)
):

    db: Session = SessionLocal()

    metadata = {}

    # Handle DICOM files
    if file.filename.endswith(".dcm"):

        dicom_data = await file.read()

        image_bytes, metadata = dicom_to_png_bytes(
            dicom_data
        )

        print("DICOM Metadata:", metadata)

    else:

        image_bytes = await file.read()

    # Upload image to cloud storage
    image_url = upload_image(
        image_bytes,
        file.filename
    )

    # Fetch previous reports
    previous_reports = (
        db.query(RadiologyReport)
        .filter(RadiologyReport.patient_id == patient_id)
        .all()
    )

    # Build historical RAG context
    history_text = ""

    for old_report in previous_reports:

        history_text += f"""
        Findings: {old_report.findings}

        Impression: {old_report.impression}

        Comparison: {old_report.comparison}
        """

    # Generate AI report
    report = await analyze_xray_image(
        image_bytes,
        history_text
    )

    # Generate vector embedding
    embedding = await generate_embedding(
        report["findings"]
    )

    # Save radiology report
    db_report = RadiologyReport(

        patient_id=patient_id,

        image_url=image_url,

        modality=metadata.get("modality", ""),

        body_part=metadata.get("body_part", ""),

        study_date=metadata.get("study_date", ""),

        indication=report.get("indication", ""),

        technique=report.get("technique", ""),

        findings=report["findings"],

        impression=report["impression"],

        abnormalities=", ".join(report["abnormalities"]),

        comparison=report.get("comparison", ""),

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
        "image_url": image_url,
        "dicom_metadata": metadata,
        "report": report
    }


@router.get("/similar-reports")
async def get_similar_reports(query: str):

    db: Session = SessionLocal()

    # Generate embedding for semantic search
    query_embedding = await generate_embedding(
        query
    )

    # Vector similarity search
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

    matches = []

    for report in results:

        patient = (
            db.query(Patient)
            .filter(
                Patient.patient_id == str(report.patient_id)
            )
            .first()
        )

        patient_name = (
            f"{patient.first_name} {patient.last_name}"
            if patient
            else "Unknown Patient"
        )

        created_at_str = (
            report.created_at.strftime(
                "%Y-%m-%d %H:%M:%S"
            )
            if report.created_at
            else "Unknown Date"
        )

        matches.append({
            "patient_id": str(report.patient_id),
            "patient_name": patient_name,
            "created_at": created_at_str,
            "image_url": report.image_url,
            "modality": report.modality,
            "body_part": report.body_part,
            "study_date": report.study_date,
            "indication": report.indication,
            "technique": report.technique,
            "findings": report.findings,
            "impression": report.impression,
            "comparison": report.comparison
        })

    db.close()

    return {
        "query": query,
        "matches": matches
    }