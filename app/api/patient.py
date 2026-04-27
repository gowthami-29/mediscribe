from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from datetime import datetime

from app.db.deps import get_db
from app.models.patient import Patient
from app.schemas.patient import PatientCreate, PatientUpdate
from app.core.deps import get_current_user
from app.core.roles import require_role

router = APIRouter()


# CREATE PATIENT
@router.post("/")
def create_patient(
    patient: PatientCreate,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_role(["admin", "practitioner"])
    )
):
    new_patient = Patient(
        **patient.dict(),

        # exact schema linkage
        user_id=current_user.user_id,
        organization_id=current_user.organization_id
    )

    db.add(new_patient)
    db.commit()
    db.refresh(new_patient)

    return new_patient


# GET ALL PATIENTS (only same organization)
@router.get("/")
def get_patients(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    patients = db.query(Patient).filter(
        Patient.organization_id == current_user.organization_id,
        Patient.deleted_at == None
    ).all()

    return patients


# GET SINGLE PATIENT
@router.get("/{patient_id}")
def get_patient(
    patient_id: str,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    patient = db.query(Patient).filter(
        Patient.patient_id == patient_id,
        Patient.organization_id == current_user.organization_id
    ).first()

    if not patient:
        return {"error": "Patient not found"}

    return patient


# UPDATE PATIENT
@router.put("/{patient_id}")
def update_patient(
    patient_id: str,
    updated: PatientUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_role(["admin", "practitioner"])
    )
):
    patient = db.query(Patient).filter(
        Patient.patient_id == patient_id,
        Patient.organization_id == current_user.organization_id
    ).first()

    if not patient:
        return {"error": "Patient not found"}

    for key, value in updated.dict(exclude_unset=True).items():
        setattr(patient, key, value)

    db.commit()
    db.refresh(patient)

    return patient


# SOFT DELETE PATIENT
@router.delete("/{patient_id}")
def delete_patient(
    patient_id: str,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_role(["admin"])
    )
):
    patient = db.query(Patient).filter(
        Patient.patient_id == patient_id,
        Patient.organization_id == current_user.organization_id
    ).first()

    if not patient:
        return {"error": "Patient not found"}

    # soft delete
    patient.deleted_at = datetime.utcnow()
    patient.status = "archived"

    db.commit()

    return {
        "message": "Patient archived successfully"
    }