from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from datetime import datetime
import json

from app.db.deps import get_db
from app.models.analysis import Analysis
from app.schemas.analysis import (
    AnalysisUpload,
    AnalysisApproval
)
from app.core.deps import get_current_user
from app.core.roles import require_role
from app.core.analysis_ai import generate_analysis

router = APIRouter()


# Upload
@router.post("/upload")
def upload_analysis(
    data: AnalysisUpload,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_role(["admin", "practitioner"])
    )
):
    record = Analysis(
        upload_id=data.upload_id,
        user_id=current_user.user_id,
        organization_id=current_user.organization_id,
        source_file_name=data.source_file_name,
        source_file_type=data.source_file_type,
        extracted_text=data.extracted_text,
        analysis_status="pending"
    )

    db.add(record)
    db.commit()
    db.refresh(record)

    return record


# Analyze
@router.post("/{analysis_id}/analyze")
def run_analysis(
    analysis_id: str,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_role(["admin", "practitioner"])
    )
):
    record = db.query(Analysis).filter(
        Analysis.analysis_id == analysis_id
    ).first()

    if not record:
        return {"error": "Analysis not found"}

    record.analysis_status = "analyzing"
    db.commit()

    ai_output = generate_analysis(
        record.extracted_text
    )

    try:
        parsed = json.loads(ai_output)
    except:
        record.analysis_status = "failed"
        db.commit()

        return {
            "error": "Invalid AI response",
            "raw": ai_output
        }

    record.generated_subjective = str(
        parsed.get("subjective")
    )

    record.generated_objective = str(
        parsed.get("objective")
    )

    record.generated_assessment = str(
        parsed.get("assessment")
    )

    record.generated_plan = str(
        parsed.get("plan")
    )

    record.generated_medications = parsed.get(
        "medications", []
    )

    record.confidence_score = parsed.get(
        "confidence_score", 95.0
    )

    record.key_entities = parsed.get(
        "key_entities", {}
    )

    record.comparison_data = parsed.get(
        "comparison_data", {}
    )

    record.analysis_status = "completed"
    record.analysis_timestamp = datetime.utcnow()

    db.commit()
    db.refresh(record)

    return record
@router.post("/{analysis_id}/approve")
def approve_analysis(
    analysis_id: str,
    data: AnalysisApproval,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_role(["admin", "supervisor"])
    )
):
    record = db.query(Analysis).filter(
        Analysis.analysis_id == analysis_id
    ).first()

    if not record:
        return {"error": "Analysis not found"}

    record.approved_by = current_user.user_id
    record.approved_at = datetime.utcnow()
    record.reviewed_at = datetime.utcnow()
    record.notes = data.notes

    db.commit()

    return {
        "message": "Analysis approved"
    }

@router.get("/{analysis_id}")
def get_analysis(
    analysis_id: str,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    record = db.query(Analysis).filter(
        Analysis.analysis_id == analysis_id,
        Analysis.organization_id ==
        current_user.organization_id
    ).first()

    if not record:
        return {"error": "Analysis not found"}

    return record