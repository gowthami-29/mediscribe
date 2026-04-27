import uuid
from sqlalchemy import (
    Column,
    String,
    DateTime,
    ForeignKey,
    Text,
    Boolean,
    Integer
)
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.sql import func
from app.db.base import Base


class Report(Base):
    __tablename__ = "reports"

    # Primary Key
    report_id = Column(
        String,
        primary_key=True,
        default=lambda: str(uuid.uuid4())
    )

    # Foreign Keys
    consultation_id = Column(
        String,
        ForeignKey("consultations.consultation_id"),
        nullable=False
    )

    user_id = Column(
        String,
        ForeignKey("users.user_id"),
        nullable=False
    )

    organization_id = Column(
        String,
        ForeignKey("organizations.organization_id"),
        nullable=False
    )

    # SOAP sections
    subjective = Column(
        Text,
        nullable=True
    )

    objective = Column(
        Text,
        nullable=True
    )

    assessment = Column(
        Text,
        nullable=True
    )

    plan = Column(
        Text,
        nullable=True
    )

    # Medications
    medications = Column(
        JSONB,
        nullable=True
    )

    # Follow-up tracking
    follow_up_needed = Column(
        Boolean,
        default=False
    )

    follow_up_days = Column(
        Integer,
        nullable=True
    )

    # Status workflow
    status = Column(
        String,
        default="draft"
    )
    # draft / reviewed / approved / signed / archived

    # Approval workflow
    approved_by = Column(
        String,
        ForeignKey("users.user_id"),
        nullable=True
    )

    approved_at = Column(
        DateTime(timezone=True),
        nullable=True
    )

    # Audit timestamps
    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now()
    )

    updated_at = Column(
        DateTime(timezone=True),
        onupdate=func.now()
    )