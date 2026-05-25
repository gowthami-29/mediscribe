import os
import io
import uuid
import base64
from datetime import datetime
from typing import Optional

from app.core.speech import transcribe_audio
from app.core.ai import generate_dictation_report


class DictationService:

    @staticmethod
    def _save_temp_file(content: bytes, ext: str) -> str:
        """Save bytes to a temp file in uploads/ and return the path."""
        upload_dir = "uploads"
        os.makedirs(upload_dir, exist_ok=True)
        filename = f"{uuid.uuid4()}.{ext}"
        path = os.path.join(upload_dir, filename)
        with open(path, "wb") as f:
            f.write(content)
        return path

    @staticmethod
    def _cleanup(path: Optional[str]):
        """Remove a temp file silently."""
        if path and os.path.exists(path):
            try:
                os.remove(path)
            except Exception:
                pass

    @staticmethod
    def transcribe_and_generate(
        audio_bytes: bytes,
        audio_ext: str = "webm",
        letterhead_bytes: Optional[bytes] = None,
        letterhead_ext: str = "png",
        patient_context: str = "",
    ) -> dict:
        """
        Full Phase 1 pipeline:
        1. Save audio → 2. Transcribe (AssemblyAI) → 3. Generate report (GPT-4) → 4. Return data
        """
        audio_path = None
        try:
            if audio_ext == 'txt':
                transcript = audio_bytes.decode('utf-8')
                transcription_result = {"confidence": 1.0}
            else:
                # Step 1: Save audio
                audio_path = DictationService._save_temp_file(audio_bytes, audio_ext)

                # Step 2: Transcribe
                transcription_result = transcribe_audio(audio_path)
                transcript = transcription_result.get("text", "")

            if not transcript:
                return {
                    "success": False,
                    "error": "Transcription returned empty text. Please speak clearly and try again.",
                    "transcript": "",
                    "report": None,
                }

            # Step 3: Generate structured report
            report_data = generate_dictation_report(transcript, patient_context)

            # Step 4: Encode letterhead as base64 for frontend rendering
            letterhead_b64 = None
            letterhead_mime = "image/png"
            if letterhead_bytes:
                letterhead_b64 = base64.b64encode(letterhead_bytes).decode("utf-8")
                mime_map = {"png": "image/png", "jpg": "image/jpeg", "jpeg": "image/jpeg", "gif": "image/gif", "webp": "image/webp"}
                letterhead_mime = mime_map.get(letterhead_ext.lower(), "image/png")

            return {
                "success": True,
                "transcript": transcript,
                "transcription_confidence": transcription_result.get("confidence"),
                "report": report_data,
                "letterhead_b64": letterhead_b64,
                "letterhead_mime": letterhead_mime,
                "generated_at": datetime.utcnow().isoformat(),
            }

        except Exception as e:
            print(f"[DictationService] Error: {e}")
            return {
                "success": False,
                "error": str(e),
                "transcript": "",
                "report": None,
            }
        finally:
            DictationService._cleanup(audio_path)

    @staticmethod
    def generate_pdf(
        report: dict,
        letterhead_bytes: Optional[bytes] = None,
        letterhead_ext: str = "png",
    ) -> bytes:
        """
        Build a professional print-ready PDF:
        Letterhead (top) + Structured Medical Report (body)
        Returns raw PDF bytes.
        """
        from reportlab.lib.pagesizes import A4
        from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
        from reportlab.lib.units import mm
        from reportlab.lib import colors
        from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, HRFlowable, Image as RLImage, Table, TableStyle
        from reportlab.lib.enums import TA_LEFT, TA_CENTER, TA_RIGHT

        buffer = io.BytesIO()
        doc = SimpleDocTemplate(
            buffer,
            pagesize=A4,
            leftMargin=20 * mm,
            rightMargin=20 * mm,
            topMargin=15 * mm,
            bottomMargin=20 * mm,
        )

        styles = getSampleStyleSheet()
        W = A4[0] - 40 * mm  # usable width

        # ── Custom styles ──────────────────────────────────────────────────────
        title_style = ParagraphStyle(
            "ReportTitle",
            parent=styles["Normal"],
            fontSize=13,
            fontName="Helvetica-Bold",
            textColor=colors.HexColor("#0d9488"),
            spaceAfter=4,
            alignment=TA_CENTER,
        )
        section_label = ParagraphStyle(
            "SectionLabel",
            parent=styles["Normal"],
            fontSize=9,
            fontName="Helvetica-Bold",
            textColor=colors.HexColor("#374151"),
            spaceBefore=8,
            spaceAfter=2,
        )
        body_style = ParagraphStyle(
            "BodyText",
            parent=styles["Normal"],
            fontSize=9.5,
            fontName="Helvetica",
            textColor=colors.HexColor("#111827"),
            leading=14,
            spaceAfter=4,
        )
        meta_style = ParagraphStyle(
            "MetaText",
            parent=styles["Normal"],
            fontSize=8.5,
            fontName="Helvetica",
            textColor=colors.HexColor("#6b7280"),
            leading=12,
        )
        disclaimer_style = ParagraphStyle(
            "Disclaimer",
            parent=styles["Normal"],
            fontSize=7.5,
            fontName="Helvetica-Oblique",
            textColor=colors.HexColor("#9ca3af"),
            alignment=TA_CENTER,
            spaceBefore=6,
        )

        story = []

        # ── Letterhead ─────────────────────────────────────────────────────────
        lh_filename = None
        try:
            if letterhead_bytes:
                try:
                    lh_ext = letterhead_ext.lower()
                    lh_dir = "uploads"
                    os.makedirs(lh_dir, exist_ok=True)
                    lh_filename = os.path.join(lh_dir, f"_lh_{uuid.uuid4()}.{lh_ext}")
                    with open(lh_filename, "wb") as f:
                        f.write(letterhead_bytes)
                    img = RLImage(lh_filename, width=W, height=None)
                    # Keep aspect ratio: max height = 60mm
                    img_w, img_h = img.imageWidth, img.imageHeight
                    aspect = img_h / img_w
                    img.drawWidth = W
                    img.drawHeight = min(W * aspect, 60 * mm)
                    story.append(img)
                    story.append(Spacer(1, 4 * mm))
                except Exception as lh_err:
                    print(f"[PDF] Letterhead render error: {lh_err}")

            # ── Report Title ───────────────────────────────────────────────────────
            story.append(Paragraph("MEDICAL CONSULTATION REPORT", title_style))
            story.append(HRFlowable(width=W, thickness=1.5, color=colors.HexColor("#0d9488"), spaceAfter=6))

            # ── Patient & Doctor Info ──────────────────────────────────────────────
            gen_at = report.get("generated_at", datetime.utcnow().isoformat())
            try:
                dt = datetime.fromisoformat(gen_at)
                date_str = dt.strftime("%d %B %Y, %I:%M %p")
            except Exception:
                date_str = gen_at

            info_data = [
                ["Patient Name:", report.get("patient_name") or "Not specified",
                 "Date:", report.get("date") or date_str],
                ["Age / Gender:",
                 f"{report.get('patient_age', '')}  {report.get('patient_gender', '')}".strip() or "—",
                 "Doctor:", report.get("doctor_name") or "—"],
            ]
            info_table = Table(info_data, colWidths=[30 * mm, 65 * mm, 20 * mm, 55 * mm])
            info_table.setStyle(TableStyle([
                ("FONTNAME", (0, 0), (-1, -1), "Helvetica"),
                ("FONTNAME", (0, 0), (0, -1), "Helvetica-Bold"),
                ("FONTNAME", (2, 0), (2, -1), "Helvetica-Bold"),
                ("FONTSIZE", (0, 0), (-1, -1), 8.5),
                ("TEXTCOLOR", (0, 0), (-1, -1), colors.HexColor("#374151")),
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
                ("TOPPADDING", (0, 0), (-1, -1), 3),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 3),
            ]))
            story.append(info_table)
            story.append(HRFlowable(width=W, thickness=0.5, color=colors.HexColor("#e5e7eb"), spaceAfter=4))

            # ── Report Sections ────────────────────────────────────────────────────
            def add_section(label: str, text: str):
                if text and text.strip():
                    story.append(Paragraph(label.upper(), section_label))
                    story.append(Paragraph(text.strip(), body_style))

            add_section("Indication / Chief Complaint", report.get("indication", ""))
            add_section("History", report.get("history", ""))
            add_section("Findings", report.get("findings", ""))
            add_section("Impression / Diagnosis", report.get("impression", ""))
            add_section("Plan", report.get("plan", ""))

            # Medications
            meds = report.get("medications", [])
            if meds:
                story.append(Paragraph("MEDICATIONS PRESCRIBED", section_label))
                for i, med in enumerate(meds, 1):
                    med_text = med if isinstance(med, str) else str(med)
                    story.append(Paragraph(f"{i}. {med_text}", body_style))

            add_section("Follow-up", report.get("follow_up", ""))
            add_section("Additional Notes", report.get("notes", ""))

            # ── Signature line ─────────────────────────────────────────────────────
            story.append(Spacer(1, 8 * mm))
            story.append(HRFlowable(width=W, thickness=0.5, color=colors.HexColor("#d1d5db"), spaceAfter=3))
            sig_data = [
                ["", "Doctor's Signature & Stamp"],
            ]
            sig_table = Table(sig_data, colWidths=[W * 0.6, W * 0.4])
            sig_table.setStyle(TableStyle([
                ("FONTNAME", (0, 0), (-1, -1), "Helvetica"),
                ("FONTSIZE", (0, 0), (-1, -1), 8),
                ("TEXTCOLOR", (0, 0), (-1, -1), colors.HexColor("#6b7280")),
                ("ALIGN", (1, 0), (1, 0), "CENTER"),
                ("TOPPADDING", (0, 0), (-1, -1), 8),
            ]))
            story.append(sig_table)

            # ── Disclaimer ─────────────────────────────────────────────────────────
            story.append(Spacer(1, 3 * mm))
            story.append(Paragraph(
                "⚠ This report was AI-assisted and generated from a voice dictation. "
                "It must be reviewed, verified, and signed by the treating physician before use. "
                "Not for standalone clinical decision-making.",
                disclaimer_style,
            ))

            doc.build(story)
            pdf_bytes = buffer.getvalue()
            buffer.close()
            return pdf_bytes
        finally:
            if lh_filename and os.path.exists(lh_filename):
                try:
                    os.remove(lh_filename)
                except Exception:
                    pass

