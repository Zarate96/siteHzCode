import json
import boto3
import os
import jwt
from botocore.exceptions import ClientError

dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table(os.environ.get('TABLE_NAME', 'hzcode-about'))

CORS_HEADERS = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*'
}
ABOUT_ID = 'main'

def verify_jwt(event):
    headers = {k.lower(): v for k, v in event.get('headers', {}).items()}
    auth_header = headers.get('authorization', '')
    jwt_secret = os.environ.get('JWT_SECRET', 'my-super-secret-jwt-key')

    if not auth_header.startswith("Bearer "):
        return {'statusCode': 401, 'headers': CORS_HEADERS, 'body': json.dumps({'message': 'Unauthorized'})}

    token = auth_header.split(" ")[1]
    try:
        jwt.decode(token, jwt_secret, algorithms=['HS256'])
        return None
    except Exception:
        return {'statusCode': 401, 'headers': CORS_HEADERS, 'body': json.dumps({'message': 'Unauthorized'})}


def lambda_handler(event, context):
    path = event.get('path', '')
    http_method = event.get('httpMethod', '')

    # Default content if DB is empty — preserves existing site content on first load
    default_about = {
        'id': ABOUT_ID,
        'name': 'Hugo Zarate Ortiz',
        'title': 'Ingeniero en TI especializado en desarrollo web.',
        'bio_1': 'Me he desempeñado en una amplia variedad de proyectos como desarrollador web, desde trabajos independientes hasta colaboraciones con empresas internacionales de consultoría. Mi enfoque se basa en el aprendizaje autodidacta y la búsqueda constante de nuevos desafíos.',
        'bio_2': 'Mi pasión por aprender me ha llevado a trabajar en diferentes proyectos y tecnologías, lo que me permite aportar soluciones innovadoras y efectivas a cualquier proyecto en el que esté involucrado.',
        'avatar_url': ''
    }

    try:
        # --- PUBLIC: Get about content ---
        if path == '/api/about' and http_method == 'GET':
            response = table.get_item(Key={'id': ABOUT_ID})
            item = response.get('Item', default_about)
            return {'statusCode': 200, 'headers': CORS_HEADERS, 'body': json.dumps(item)}

        # --- PROTECTED: Update about content ---
        elif path == '/api/about' and http_method == 'PUT':
            auth_error = verify_jwt(event)
            if auth_error:
                return auth_error

            body = json.loads(event.get('body', '{}'))
            item = {
                'id': ABOUT_ID,
                'name': body.get('name', default_about['name']),
                'title': body.get('title', default_about['title']),
                'bio_1': body.get('bio_1', default_about['bio_1']),
                'bio_2': body.get('bio_2', default_about['bio_2']),
                'avatar_url': body.get('avatar_url', ''),
            }
            table.put_item(Item=item)
            return {'statusCode': 200, 'headers': CORS_HEADERS, 'body': json.dumps({'message': 'About content updated'})}

    except ClientError as e:
        return {'statusCode': 500, 'headers': CORS_HEADERS, 'body': json.dumps({'error': str(e)})}
    except Exception as e:
        return {'statusCode': 500, 'headers': CORS_HEADERS, 'body': json.dumps({'error': str(e)})}

    return {'statusCode': 400, 'headers': CORS_HEADERS, 'body': json.dumps({'message': 'Invalid request'})}
