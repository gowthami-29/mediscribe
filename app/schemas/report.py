from pydantic import BaseModel
from typing import Optional, List, Dict
from datetime import datetime


class ReportCreate(BaseModel):
    consultation_id: str


class ReportUpdate(BaseModel):
    subjective: Optional[str] = None
    objective: Optional[str] = None
    assessment: Optional[str] = None
    plan: Optional[str] = None

    medications: Optional[List[Dict]] = None

    follow_up_needed: Optional[bool] = False
    follow_up_days: Optional[int] = None

    status: Optional[str] = None