from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.deps import get_db
from app.core.deps import get_current_user
from app.models.patient import Patient
from app.models.report import Report
from app.models.user import User

router = APIRouter()

@router.get("/reports")
def get_my_reports(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    patient = db.query(Patient).filter(
        Patient.email == current_user.email
    ).first()

    if not patient:
        raise HTTPException(
            status_code=404,
            detail="Patient not found"
        )

    reports = db.query(Report).filter(
        Report.patient_id == patient.patient_id
    ).order_by(
        Report.created_at.desc()
    ).all()

    return reports


@router.get("/reports/{report_id}")
def get_my_report(
    report_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    patient = db.query(Patient).filter(
        Patient.email == current_user.email
    ).first()

    if not patient:
        raise HTTPException(
            status_code=404,
            detail="Patient not found"
        )

    report = db.query(Report).filter(
        Report.report_id == report_id,
        Report.patient_id == patient.patient_id
    ).first()

    if not report:
        raise HTTPException(
            status_code=404,
            detail="Report not found"
        )

    return report