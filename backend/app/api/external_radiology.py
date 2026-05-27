from fastapi import APIRouter, UploadFile, File, Depends
from sqlalchemy.orm import Session
from uuid import UUID

from app.db.session import SessionLocal
from app.core.api_key_auth import validate_api_key

from app.services.radiology_service import (
    analyze_xray_image,
    generate_embedding
)

from app.services.storage_service import (
    upload_image,
    generate_signed_url
)

from app.services.dicom_service import (
    dicom_to_png_bytes
)

from app.models.radiology import RadiologyReport

router = APIRouter()


@router.post("/analyze-xray")
async def analyze_xray_external(

    patient_id: UUID,

    file: UploadFile = File(...),

    api_key = Depends(validate_api_key)

):

    db: Session = SessionLocal()

    metadata = {}

    # Handle DICOM
    if file.filename.lower().endswith(".dcm"):

        dicom_data = await file.read()

        image_bytes, metadata = dicom_to_png_bytes(
            dicom_data
        )

        raw_storage_bytes = dicom_data

    else:

        image_bytes = await file.read()

        raw_storage_bytes = image_bytes

    # Upload image
    image_key = upload_image(
        raw_storage_bytes,
        file.filename
    )

    # Previous reports
    previous_reports = (
        db.query(RadiologyReport)
        .filter(
            RadiologyReport.patient_id == patient_id
        )
        .all()
    )

    history_text = ""

    for old_report in previous_reports:

        history_text += f"""

        Findings: {old_report.findings}

        Impression: {old_report.impression}

        Comparison: {old_report.comparison}

        """

    # AI Analysis
    report = await analyze_xray_image(
        image_bytes,
        history_text
    )

    # Embedding
    embedding = await generate_embedding(
        report["findings"]
    )

    # Save report
    db_report = RadiologyReport(

        patient_id=patient_id,

        image_url=image_key,

        modality=metadata.get(
            "modality",
            ""
        ),

        body_part=metadata.get(
            "body_part",
            ""
        ),

        study_date=metadata.get(
            "study_date",
            ""
        ),

        indication=report.get(
            "indication",
            ""
        ),

        technique=report.get(
            "technique",
            ""
        ),

        findings=report["findings"],

        impression=report["impression"],

        abnormalities=", ".join(
            report["abnormalities"]
        ),

        comparison=report.get(
            "comparison",
            ""
        ),

        status="DRAFT",

        embedding=embedding
    )

    db.add(db_report)

    db.commit()

    db.refresh(db_report)

    signed_image_url = generate_signed_url(
        db_report.image_url
    )

    db.close()

    return {

        "success": True,

        "patient_id": str(patient_id),

        "report_id": str(db_report.id),

        "previous_reports_count": len(
            previous_reports
        ),

        "image_url": signed_image_url,

        "dicom_metadata": metadata,

        "report": {
            **report,
            "status": "DRAFT"
        }
    }