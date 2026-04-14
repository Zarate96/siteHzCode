import json
import boto3
import os
import uuid
import jwt
from botocore.exceptions import ClientError

dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table(os.environ.get('TABLE_NAME', 'hzcode-portfolio'))

CORS_HEADERS = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*'
}

def verify_jwt(event):
    """Returns None if valid, or an error response dict if invalid."""
    headers = {k.lower(): v for k, v in event.get('headers', {}).items()}
    auth_header = headers.get('authorization', '')
    jwt_secret = os.environ.get('JWT_SECRET', 'my-super-secret-jwt-key')

    if not auth_header.startswith("Bearer "):
        return {'statusCode': 401, 'headers': CORS_HEADERS, 'body': json.dumps({'message': 'Missing or invalid token format'})}

    token = auth_header.split(" ")[1]
    try:
        jwt.decode(token, jwt_secret, algorithms=['HS256'])
        return None  # Valid
    except Exception:
        return {'statusCode': 401, 'headers': CORS_HEADERS, 'body': json.dumps({'message': 'Unauthorized'})}


def lambda_handler(event, context):
    path = event.get('path', '')
    http_method = event.get('httpMethod', '')

    try:
        # --- PUBLIC: List all projects ---
        if path == '/api/portfolio' and http_method == 'GET':
            response = table.scan()
            items = response.get('Items', [])
            items.sort(key=lambda x: x.get('fecha', ''), reverse=True)
            return {
                'statusCode': 200,
                'headers': CORS_HEADERS,
                'body': json.dumps(items)
            }

        # --- PROTECTED: Create project ---
        elif path == '/api/portfolio' and http_method == 'POST':
            auth_error = verify_jwt(event)
            if auth_error:
                return auth_error

            body = json.loads(event.get('body', '{}'))
            if not body.get('title'):
                return {'statusCode': 400, 'headers': CORS_HEADERS, 'body': json.dumps({'message': 'title is required'})}

            import datetime
            item = {
                'id': str(uuid.uuid4()),
                'fecha': datetime.datetime.utcnow().isoformat(),
                'title': body.get('title', ''),
                'description': body.get('description', ''),
                'image_url': body.get('image_url', ''),
                'project_url': body.get('project_url', ''),
                'tags': body.get('tags', []),
            }
            table.put_item(Item=item)
            return {'statusCode': 201, 'headers': CORS_HEADERS, 'body': json.dumps({'message': 'Project created', 'id': item['id']})}

        # --- PROTECTED: Delete project ---
        elif path.startswith('/api/portfolio/') and http_method == 'DELETE':
            auth_error = verify_jwt(event)
            if auth_error:
                return auth_error

            project_id = event['pathParameters'].get('id')
            table.delete_item(Key={'id': project_id})
            return {'statusCode': 200, 'headers': CORS_HEADERS, 'body': json.dumps({'message': 'Project deleted'})}

    except ClientError as e:
        return {'statusCode': 500, 'headers': CORS_HEADERS, 'body': json.dumps({'error': str(e)})}
    except Exception as e:
        return {'statusCode': 500, 'headers': CORS_HEADERS, 'body': json.dumps({'error': str(e)})}

    return {'statusCode': 400, 'headers': CORS_HEADERS, 'body': json.dumps({'message': 'Invalid request'})}
