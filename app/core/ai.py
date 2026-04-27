import requests
import os

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
ENDPOINT = os.getenv("ENDPOINT")

 

def generate_soap(text: str):
    headers = {
        "api-key": OPENAI_API_KEY,
        "Content-Type": "application/json"
    }

    body = {
        "messages": [
            {
                "role": "system",
                "content": "Convert medical text into SOAP format in JSON with keys: subjective, objective, assessment, plan"
            },
            {
                "role": "user",
                "content": text
            }
        ]
    }

    response = requests.post(ENDPOINT, headers=headers, json=body)

    data = response.json()

    # 🔥 Extract AI response
    return data["choices"][0]["message"]["content"]