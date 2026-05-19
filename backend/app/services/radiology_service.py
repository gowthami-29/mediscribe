from openai import AzureOpenAI
import base64
import os
import json

client = AzureOpenAI(
    api_key=os.getenv("OPENAI_API_KEY"),
    api_version="2025-01-01-preview",
    azure_endpoint=os.getenv("ENDPOINT")
)


async def generate_embedding(text: str):

    response = client.embeddings.create(
        model="embedding-model",
        input=text
    )

    return response.data[0].embedding


async def analyze_xray_image(
    image_bytes: bytes,
    history_text: str = ""
):

    base64_image = base64.b64encode(image_bytes).decode("utf-8")

    response = client.chat.completions.create(
        model="gpt-5.4",
        messages=[
            {
                "role": "system",
                "content": f"""
                You are an AI radiology assistant.

                Previous radiology history:

                {history_text}

                Analyze the uploaded X-ray.

                Return ONLY valid JSON in this format:

                {{
                    "findings": "",
                    "impression": "",
                    "abnormalities": [],
                    "comparison": ""
                }}

                Do not return markdown.
                Do not return explanation.
                Only return JSON.
                """
            },
            {
                "role": "user",
                "content": [
                    {
                        "type": "text",
                        "text": "Analyze this X-ray image."
                    },
                    {
                        "type": "image_url",
                        "image_url": {
                            "url": f"data:image/png;base64,{base64_image}"
                        }
                    }
                ]
            }
        ],
        max_completion_tokens=1000
    )

    content = response.choices[0].message.content

    result = json.loads(content)

    return result