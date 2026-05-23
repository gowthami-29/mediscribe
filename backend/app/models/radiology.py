from sqlalchemy import Column, Text, DateTime
from sqlalchemy.dialects.postgresql import UUID
from datetime import datetime
from app.db.base import Base
from pgvector.sqlalchemy import Vector
import uuid


class RadiologyReport(Base):
    __tablename__ = "radiology_reports"

    id = Column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4
    )

    patient_id = Column(UUID(as_uuid=True))

    modality = Column(Text)

    body_part = Column(Text)
    
    image_url = Column(Text)

    study_date = Column(Text)

    indication = Column(Text)

    technique = Column(Text)

    findings = Column(Text)

    impression = Column(Text)

    abnormalities = Column(Text)

    comparison = Column(Text)

    status = Column(Text, default="DRAFT")

    embedding = Column(Vector(1536))

    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )