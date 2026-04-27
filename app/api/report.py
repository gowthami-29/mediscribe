from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from datetime import datetime

from app.db.deps import get_db
from app.models.report import Report
from app.schemas.report import ReportUpdate
from app.core.deps import get_current_user
from app.core.roles import require_role

router = APIRouter()
@router.get("/{report_id}")
def get_report(
    report_id: str,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    report = db.query(Report).filter(
        Report.report_id == report_id,
        Report.organization_id == current_user.organization_id
    ).first()

    if not report:
        return {"error": "Report not found"}

    return report
@router.put("/{report_id}")
def update_report(
    report_id: str,
    updated: ReportUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_role(["admin", "practitioner"])
    )
):
    report = db.query(Report).filter(
        Report.report_id == report_id
    ).first()

    if not report:
        return {"error": "Report not found"}

    for key, value in updated.dict(
        exclude_unset=True
    ).items():
        setattr(report, key, value)

    db.commit()
    db.refresh(report)

    return report
@router.post("/{report_id}/approve")
def approve_report(
    report_id: str,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_role(["admin", "supervisor"])
    )
):
    report = db.query(Report).filter(
        Report.report_id == report_id
    ).first()

    if not report:
        return {"error": "Report not found"}

    report.status = "approved"
    report.approved_by = current_user.user_id
    report.approved_at = datetime.utcnow()

    db.commit()

    return {
        "message": "Report approved"
    }
@router.post("/{report_id}/sign")
def sign_report(
    report_id: str,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_role(["admin", "practitioner"])
    )
):
    report = db.query(Report).filter(
        Report.report_id == report_id
    ).first()

    if not report:
        return {"error": "Report not found"}

    report.status = "signed"

    db.commit()

    return {
        "message": "Report signed"
    }

@router.post("/{report_id}/archive")
def archive_report(
    report_id: str,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_role(["admin"])
    )
):
    report = db.query(Report).filter(
        Report.report_id == report_id
    ).first()

    if not report:
        return {"error": "Report not found"}

    report.status = "archived"

    db.commit()

    return {
        "message": "Report archived"
    }