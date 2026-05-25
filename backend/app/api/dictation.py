import os
import uuid
from typing import Optional

from fastapi import APIRouter, File, Form, UploadFile, HTTPException, Depends
from fastapi.responses import Response

from app.core.deps import get_current_user
from app.db.deps import get_db
from app.models.report import Report
from sqlalchemy.orm import Session
from app.services.dictation_service import DictationService

router = APIRouter()


@router.post("/transcribe-and-report")
async def transcribe_and_report(
    audio: UploadFile = File(..., description="Recorded audio file (webm/wav/mp3)"),
    letterhead: Optional[UploadFile] = File(None, description="Clinic letterhead image (PNG/JPG)"),
    patient_context: str = Form("", description="Optional historical patient context"),
    current_user: dict = Depends(get_current_user),
):
    """
    Phase 1 Dictation Endpoint
    --------------------------
    1. Doctor uploads audio recording
    2. Optionally uploads letterhead image
    3. Returns: transcript + structured AI report + letterhead (base64)
    """
    try:
        audio_bytes = await audio.read()
        if not audio_bytes:
            raise HTTPException(status_code=400, detail="Audio file is empty")

        # Determine audio extension
        audio_filename = audio.filename or "recording.webm"
        audio_ext = audio_filename.rsplit(".", 1)[-1].lower() if "." in audio_filename else "webm"

        # Read letterhead if provided
        letterhead_bytes = None
        letterhead_ext = "png"
        if letterhead and letterhead.filename:
            letterhead_bytes = await letterhead.read()
            lh_filename = letterhead.filename or "letterhead.png"
            letterhead_ext = lh_filename.rsplit(".", 1)[-1].lower() if "." in lh_filename else "png"

        result = DictationService.transcribe_and_generate(
            audio_bytes=audio_bytes,
            audio_ext=audio_ext,
            letterhead_bytes=letterhead_bytes,
            letterhead_ext=letterhead_ext,
            patient_context=patient_context,
        )

        if not result.get("success"):
            raise HTTPException(status_code=422, detail=result.get("error", "Processing failed"))

        # Override doctor_name with the logged-in doctor's name
        if "report" in result and result["report"]:
            result["report"]["doctor_name"] = current_user.full_name

        return result

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Dictation processing failed: {str(e)}")


@router.post("/generate-pdf")
async def generate_pdf(
    audio: UploadFile = File(..., description="Recorded audio file"),
    letterhead: Optional[UploadFile] = File(None, description="Clinic letterhead image"),
    patient_context: str = Form("", description="Optional historical patient context"),
    current_user: dict = Depends(get_current_user),
):
    """
    Phase 1 Full Pipeline → PDF Download
    -------------------------------------
    Transcribes audio → Generates report → Returns print-ready PDF with letterhead.
    """
    try:
        audio_bytes = await audio.read()
        if not audio_bytes:
            raise HTTPException(status_code=400, detail="Audio file is empty")

        audio_filename = audio.filename or "recording.webm"
        audio_ext = audio_filename.rsplit(".", 1)[-1].lower() if "." in audio_filename else "webm"

        letterhead_bytes = None
        letterhead_ext = "png"
        if letterhead and letterhead.filename:
            letterhead_bytes = await letterhead.read()
            lh_filename = letterhead.filename or "letterhead.png"
            letterhead_ext = lh_filename.rsplit(".", 1)[-1].lower() if "." in lh_filename else "png"

        # Step 1: Transcribe + Generate report data
        result = DictationService.transcribe_and_generate(
            audio_bytes=audio_bytes,
            audio_ext=audio_ext,
            letterhead_bytes=letterhead_bytes,
            letterhead_ext=letterhead_ext,
            patient_context=patient_context,
        )

        if not result.get("success"):
            raise HTTPException(status_code=422, detail=result.get("error", "Processing failed"))

        report = result.get("report", {})
        report["generated_at"] = result.get("generated_at", "")
        # Override doctor_name with the logged-in doctor's name
        report["doctor_name"] = current_user.full_name

        # Step 2: Build PDF
        pdf_bytes = DictationService.generate_pdf(
            report=report,
            letterhead_bytes=letterhead_bytes,
            letterhead_ext=letterhead_ext,
        )

        # Return as downloadable PDF
        return Response(
            content=pdf_bytes,
            media_type="application/pdf",
            headers={
                "Content-Disposition": f'attachment; filename="mediscribe_report_{uuid.uuid4().hex[:8]}.pdf"',
                "Content-Length": str(len(pdf_bytes)),
            },
        )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"PDF generation failed: {str(e)}")


@router.post("/generate-pdf-from-report")
async def generate_pdf_from_report(
    report_data: str = Form(..., description="JSON string of the report dict"),
    letterhead: Optional[UploadFile] = File(None),
    current_user: dict = Depends(get_current_user),
):
    """
    Generate PDF from an already-processed report dict (no re-transcription needed).
    Used by the frontend after the user has reviewed and optionally edited the report.
    """
    import json
    try:
        report_dict = json.loads(report_data)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid JSON format for report_data: {str(e)}")

    try:
        letterhead_bytes = None
        letterhead_ext = "png"
        if letterhead and letterhead.filename:
            letterhead_bytes = await letterhead.read()
            lh_filename = letterhead.filename or "letterhead.png"
            letterhead_ext = lh_filename.rsplit(".", 1)[-1].lower() if "." in lh_filename else "png"

        pdf_bytes = DictationService.generate_pdf(
            report=report_dict,
            letterhead_bytes=letterhead_bytes,
            letterhead_ext=letterhead_ext,
        )

        return Response(
            content=pdf_bytes,
            media_type="application/pdf",
            headers={
                "Content-Disposition": f'attachment; filename="mediscribe_report_{uuid.uuid4().hex[:8]}.pdf"',
                "Content-Length": str(len(pdf_bytes)),
            },
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"PDF generation failed: {str(e)}")

@router.post("/save")
async def save_dictation(
    report_data: str = Form(..., description="JSON string of the dictation report"),
    letterhead: Optional[UploadFile] = File(None, description="Clinic letterhead image (PNG/JPG)"),
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Saves the final, edited Voice Dictation report and letterhead to the database.
    """
    try:
        import json
        report_dict = json.loads(report_data)
        
        letterhead_path = None
        if letterhead and letterhead.filename:
            upload_dir = os.path.join(os.getcwd(), "uploads", "letterheads")
            os.makedirs(upload_dir, exist_ok=True)
            ext = letterhead.filename.rsplit(".", 1)[-1].lower() if "." in letterhead.filename else "png"
            filename = f"{uuid.uuid4().hex}.{ext}"
            file_path = os.path.join(upload_dir, filename)
            with open(file_path, "wb") as buffer:
                buffer.write(await letterhead.read())
            letterhead_path = file_path

        subjective_data = {
            "indication": report_dict.get("indication", ""),
            "history": report_dict.get("history", "")
        }
        objective_data = {
            "findings": report_dict.get("findings", "")
        }
        assessment_data = {
            "impression": report_dict.get("impression", "")
        }
        plan_data = {
            "plan": report_dict.get("plan", ""),
            "follow_up": report_dict.get("follow_up", ""),
            "notes": report_dict.get("notes", "")
        }

        db_report = Report(
            user_id=current_user.user_id,
            organization_id=current_user.organization_id,
            status="approved",
            subjective=json.dumps(subjective_data),
            objective=json.dumps(objective_data),
            assessment=json.dumps(assessment_data),
            plan=json.dumps(plan_data),
            medications=report_dict.get("medications", []),
            key_entities={
                "source": "voice_dictation",
                "letterhead_path": letterhead_path,
                "original_dictation": report_dict
            }
        )
        
        if report_dict.get("patient_name"):
            db_report.key_entities["patient_name"] = report_dict.get("patient_name")
            
        db.add(db_report)
        db.commit()
        db.refresh(db_report)
        
        return {"success": True, "report_id": db_report.report_id}
        
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to save dictation report: {str(e)}")
