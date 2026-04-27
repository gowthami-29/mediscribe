import requests
import json

import os

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
ENDPOINT = os.getenv("ENDPOINT")



def generate_analysis(text: str):
    headers = {
        "api-key": OPENAI_API_KEY,
        "Content-Type": "application/json"
    }

    body = {
        "messages": [
            {
                "role": "user",
                "content": f"""
Analyze this medical report and return ONLY valid JSON:

{{
  "summary": "",
  "possible_conditions": [],
  "risks": "",
  "recommendations": ""
}}

Medical Report:
{text}
"""
            }
        ]
    }

    response = requests.post(
        ENDPOINT,
        headers=headers,
        json=body
    )

    data = response.json()

    print(data)

    if "choices" not in data:
        return json.dumps({
            "error": data
        })

    return data["choices"][0]["message"]["content"]