import json
import boto3
import os
import uuid
import datetime
import jwt
from botocore.exceptions import ClientError

dynamodb = boto3.resource('dynamodb')
table_name = os.environ.get('TABLE_NAME', 'hzcode-messages')
table = dynamodb.Table(table_name)

def lambda_handler(event, context):
    path = event.get('path', '')
    http_method = event.get('httpMethod', '')

    try:
        if path == '/api/contact' and http_method == 'POST':
            body = json.loads(event.get('body', '{}'))
            
            # Basic validation
            if not body.get('name') or not body.get('email') or not body.get('message'):
                return {
                    'statusCode': 400,
                    'headers': {'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'message': 'Missing required fields'})
                }
            
            item_id = str(uuid.uuid4())
            timestamp = datetime.datetime.utcnow().isoformat()
            
            item = {
                'id': item_id,
                'fecha': timestamp,
                'nombre': body.get('name'),
                'email': body.get('email'),
                'asunto': body.get('subject', 'Sin asunto'),
                'telefono': body.get('phone', ''),
                'mensaje': body.get('message'),
                'is_answered': False
            }
            
            table.put_item(Item=item)
            
            # Note: We can add boto3 SES code here to send an email notification to hzcode
            
            return {
                'statusCode': 201,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({
                    'message': 'Mensaje enviado exitosamente',
                    'id': item_id
                })
            }
            
        elif path == '/api/contact' and http_method == 'GET':
            # Admin read all messages
            headers = {k.lower(): v for k, v in event.get('headers', {}).items()}
            auth_header = headers.get('authorization', '')
            jwt_secret = os.environ.get('JWT_SECRET', 'my-super-secret-jwt-key')
            
            if not auth_header.startswith("Bearer "):
                return {
                    'statusCode': 401,
                    'headers': {'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'message': 'Missing or invalid token format'})
                }
                
            token = auth_header.split(" ")[1]
            try:
                jwt.decode(token, jwt_secret, algorithms=['HS256'])
            except Exception:
                return {
                    'statusCode': 401,
                    'headers': {'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'message': 'Unauthorized'})
                }
                
            response = table.scan()
            items = response.get('Items', [])
            # Sort natively in python descending by date
            items.sort(key=lambda x: x.get('fecha', ''), reverse=True)
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps(items)
            }
            
        elif path.startswith('/api/contact/') and http_method == 'PUT':
            # Admin update message status
            headers = {k.lower(): v for k, v in event.get('headers', {}).items()}
            auth_header = headers.get('authorization', '')
            jwt_secret = os.environ.get('JWT_SECRET', 'my-super-secret-jwt-key')
            
            if not auth_header.startswith("Bearer "):
                return {
                    'statusCode': 401,
                    'headers': {'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'message': 'Missing or invalid token format'})
                }
                
            token = auth_header.split(" ")[1]
            try:
                jwt.decode(token, jwt_secret, algorithms=['HS256'])
            except Exception:
                return {
                    'statusCode': 401,
                    'headers': {'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'message': 'Unauthorized'})
                }
                
            msg_id = event['pathParameters'].get('id')
            body = json.loads(event.get('body', '{}'))
            is_answered = body.get('is_answered', True)
            
            table.update_item(
                Key={'id': msg_id},
                UpdateExpression="set is_answered=:a",
                ExpressionAttributeValues={':a': is_answered},
                ReturnValues="UPDATED_NEW"
            )
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'message': 'Message updated successfully'})
            }
                
    except ClientError as e:
        return {
            'statusCode': 500,
            'headers': {'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': str(e)})
        }
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': str(e)})
        }
        
    return {
        'statusCode': 400,
        'headers': {'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'message': 'Invalid request'})
    }
