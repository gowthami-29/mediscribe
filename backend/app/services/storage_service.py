import boto3
import uuid
import os

s3 = boto3.client(
    "s3",
    endpoint_url=os.getenv("B2_ENDPOINT"),
    aws_access_key_id=os.getenv("B2_KEY_ID"),
    aws_secret_access_key=os.getenv("B2_APPLICATION_KEY")
)

def upload_image(file_bytes, filename):

    unique_name = f"{uuid.uuid4()}-{filename}"

    s3.put_object(
        Bucket=os.getenv("B2_BUCKET_NAME"),
        Key=unique_name,
        Body=file_bytes
    )

    return (
        f"{os.getenv('B2_ENDPOINT')}/"
        f"{os.getenv('B2_BUCKET_NAME')}/"
        f"{unique_name}"
    )