from fastapi import FastAPI
from app.db.base import Base
from app.db.session import engine

# models
from app.api.speech import router as speech_router
from app.models.user import User
from app.models.organization import Organization
from app.models.patient import Patient
from app.models.consultation import Consultation
from app.models.report import Report
from app.models.analysis import Analysis


# routers
from app.api.auth import router as auth_router
from app.api.patient import router as patient_router
from app.api.consultation import router as consultation_router
from app.api.report import router as report_router
from app.api.analysis import router as analysis_router

app = FastAPI()

Base.metadata.create_all(bind=engine)

app.include_router(auth_router, prefix="/auth", tags=["Auth"])
app.include_router(patient_router, prefix="/patients", tags=["Patients"])
app.include_router(consultation_router, prefix="/consultations", tags=["Consultations"])
app.include_router(speech_router,prefix="/speech",tags=["Speech"])
app.include_router( report_router,prefix="/reports",tags=["Reports"])
app.include_router(analysis_router, prefix="/ai-analysis", tags=["AI Analysis"])