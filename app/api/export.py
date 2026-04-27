from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.deps import get_db
from app.models.report import Report
from app.core.deps import get_current_user
from reportlab.platypus import SimpleDocTemplate, Paragraph
from reportlab.lib.styles import getSampleStyleSheet

router = APIRouter()

@router.post("/{id}/export")
def export_report(
    id: str,
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    # Search using consultation_id
    report = db.query(Report).filter(
        Report.consultation_id == id
    ).first()

    if not report:
        return {"error": "Report not found"}

    file_path = f"{id}.pdf"

    doc = SimpleDocTemplate(file_path)
    styles = getSampleStyleSheet()

    content = [
        Paragraph(f"Subjective: {report.subjective}", styles["Normal"]),
        Paragraph(f"Objective: {report.objective}", styles["Normal"]),
        Paragraph(f"Assessment: {report.assessment}", styles["Normal"]),
        Paragraph(f"Plan: {report.plan}", styles["Normal"]),
    ]

    doc.build(content)

    return {
        "message": "PDF created",
        "file": file_path
    }