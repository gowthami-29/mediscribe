from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import date
from decimal import Decimal


class PatientCreate(BaseModel):
    # Basic info
    first_name: str
    last_name: str
    date_of_birth: Optional[date] = None
    gender: Optional[str] = None
    medical_id: Optional[str] = None

    # Contact info
    email: Optional[EmailStr] = None
    phone: Optional[str] = None

    # Address
    address_line1: Optional[str] = None
    address_line2: Optional[str] = None
    city: Optional[str] = None
    state_province: Optional[str] = None
    postal_code: Optional[str] = None
    country: Optional[str] = None

    # Emergency contact
    emergency_contact_name: Optional[str] = None
    emergency_contact_phone: Optional[str] = None

    # Medical information
    medical_history: Optional[str] = None
    allergies: Optional[str] = None
    current_medications: Optional[str] = None

    # Insurance
    insurance_provider: Optional[str] = None
    insurance_policy: Optional[str] = None
    insurance_verified: Optional[bool] = False

    # Physical details
    blood_type: Optional[str] = None
    height_cm: Optional[Decimal] = None
    weight_kg: Optional[Decimal] = None

    # Status
    status: Optional[str] = "active"


class PatientUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    date_of_birth: Optional[date] = None
    gender: Optional[str] = None
    medical_id: Optional[str] = None

    email: Optional[EmailStr] = None
    phone: Optional[str] = None

    address_line1: Optional[str] = None
    address_line2: Optional[str] = None
    city: Optional[str] = None
    state_province: Optional[str] = None
    postal_code: Optional[str] = None
    country: Optional[str] = None

    emergency_contact_name: Optional[str] = None
    emergency_contact_phone: Optional[str] = None

    medical_history: Optional[str] = None
    allergies: Optional[str] = None
    current_medications: Optional[str] = None

    insurance_provider: Optional[str] = None
    insurance_policy: Optional[str] = None
    insurance_verified: Optional[bool] = None

    blood_type: Optional[str] = None
    height_cm: Optional[Decimal] = None
    weight_kg: Optional[Decimal] = None

    status: Optional[str] = None