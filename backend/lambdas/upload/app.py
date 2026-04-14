import json
import boto3
import os
import jwt
import uuid
from botocore.exceptions import ClientError

s3_client = boto3.client('s3')
BUCKET_NAME = os.environ.get('MEDIA_BUCKET', 'hzcode-mx-media-870819815698')
JWT_SECRET = os.environ.get('JWT_SECRET', 'my-super-secret-jwt-key')

CORS_HEADERS = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*'
}

def lambda_handler(event, context):
    path = event.get('path', '')
    http_method = event.get('httpMethod', '')

    try:
        if path == '/api/upload' and http_method == 'POST':
            # Verify JWT
            headers = {k.lower(): v for k, v in event.get('headers', {}).items()}
            auth_header = headers.get('authorization', '')

            if not auth_header.startswith("Bearer "):
                return {'statusCode': 401, 'headers': CORS_HEADERS, 'body': json.dumps({'message': 'Unauthorized'})}

            token = auth_header.split(" ")[1]
            try:
                jwt.decode(token, JWT_SECRET, algorithms=['HS256'])
            except Exception:
                return {'statusCode': 401, 'headers': CORS_HEADERS, 'body': json.dumps({'message': 'Unauthorized'})}

            body = json.loads(event.get('body', '{}'))
            original_filename = body.get('filename', 'upload.jpg')
            content_type = body.get('content_type', 'image/jpeg')

            # Use a UUID prefix to prevent collisions and make URLs unique
            ext = original_filename.rsplit('.', 1)[-1] if '.' in original_filename else 'jpg'
            object_key = f"media/{uuid.uuid4()}.{ext}"

            # Generate presigned URL valid for 5 minutes
            upload_url = s3_client.generate_presigned_url(
                'put_object',
                Params={
                    'Bucket': BUCKET_NAME,
                    'Key': object_key,
                    'ContentType': content_type,
                },
                ExpiresIn=300
            )

            # The final public URL of the uploaded file
            public_url = f"https://{BUCKET_NAME}.s3.amazonaws.com/{object_key}"

            return {
                'statusCode': 200,
                'headers': CORS_HEADERS,
                'body': json.dumps({
                    'upload_url': upload_url,
                    'public_url': public_url,
                    'object_key': object_key
                })
            }

    except ClientError as e:
        return {'statusCode': 500, 'headers': CORS_HEADERS, 'body': json.dumps({'error': str(e)})}
    except Exception as e:
        return {'statusCode': 500, 'headers': CORS_HEADERS, 'body': json.dumps({'error': str(e)})}

    return {'statusCode': 400, 'headers': CORS_HEADERS, 'body': json.dumps({'message': 'Invalid request'})}
