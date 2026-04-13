import json
import boto3
import os
import uuid
import datetime
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
                
    except ClientError as e:
        return {
            'statusCode': 500,
            'body': json.dumps({'error': str(e)})
        }
    except Exception as e:
        return {
            'statusCode': 500,
            'body': json.dumps({'error': str(e)})
        }
        
    return {
        'statusCode': 400,
        'body': json.dumps({'message': 'Invalid request'})
    }
