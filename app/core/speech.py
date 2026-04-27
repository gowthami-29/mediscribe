import requests
import os


AZURE_SPEECH_KEY = os.getenv("OPENAI_API_KEY")
AZURE_SPEECH_ENDPOINT = os.getenv("ENDPOINT")


def transcribe_audio(file_path):
    # later compress audio here

    with open(file_path, "rb") as audio:
        audio_data = audio.read()

    headers = {
        "Ocp-Apim-Subscription-Key": AZURE_SPEECH_KEY,
        "Content-Type": "audio/wav"
    }

    response = requests.post(
        AZURE_SPEECH_ENDPOINT,
        headers=headers,
        data=audio_data
    )

    result = response.json()

    transcript = result.get("DisplayText", "")

    if len(transcript) < 5:
        return "Low quality transcription"

    return transcript