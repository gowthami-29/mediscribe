import os
from fastapi import APIRouter, UploadFile, File
from app.core.speech import transcribe_audio

router = APIRouter()


@router.post("/transcribe")
async def transcribe(file: UploadFile = File(...)):
    
    os.makedirs("uploads", exist_ok=True)

    file_path = f"uploads/{file.filename}"

    with open(file_path, "wb") as buffer:
        buffer.write(await file.read())

    text = transcribe_audio(file_path)

    return {
        "transcription": text
    }