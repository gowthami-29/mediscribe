from pydantic import BaseModel
from typing import Optional, List, Dict
from decimal import Decimal


class AnalysisUpload(BaseModel):
    upload_id: str
    source_file_name: str
    source_file_type: str
    extracted_text: str


class AnalysisUpdate(BaseModel):
    notes: Optional[str] = None


class AnalysisApproval(BaseModel):
    notes: Optional[str] = None