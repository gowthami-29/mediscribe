import boto3
import uuid
import os

from botocore.client import Config


s3 = boto3.client(
    "s3",

    endpoint_url=os.getenv("B2_ENDPOINT"),

    aws_access_key_id=os.getenv("B2_KEY_ID"),

    aws_secret_access_key=os.getenv("B2_APPLICATION_KEY"),

    config=Config(
        signature_version="s3v4"
    )
)


def upload_image(file_bytes, filename):

    unique_name = (
        f"{uuid.uuid4()}-{filename}"
    )

    s3.put_object(
        Bucket=os.getenv("B2_BUCKET_NAME"),
        Key=unique_name,
        Body=file_bytes
    )

    return unique_name


def generate_signed_url(file_key):

    url = s3.generate_presigned_url(

        ClientMethod="get_object",

        Params={
            "Bucket": os.getenv("B2_BUCKET_NAME"),
            "Key": file_key
        },

        ExpiresIn=3600
    )

    return url