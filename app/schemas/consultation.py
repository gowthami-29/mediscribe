from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from decimal import Decimal


class ConsultationCreate(BaseModel):
    patient_id: str
    consultation_type: str
    chief_complaint: Optional[str] = None
    scheduled_at: Optional[datetime] = None


class ConsultationUpdate(BaseModel):
    status: Optional[str] = None
    notes: Optional[str] = None
    transcription_text: Optional[str] = None
    transcription_status: Optional[str] = None
    transcription_confidence: Optional[Decimal] = None


class AudioMetadata(BaseModel):
    audio_file_id: str
    audio_duration_seconds: int
    audio_bitrate: str
    audio_checksum: str