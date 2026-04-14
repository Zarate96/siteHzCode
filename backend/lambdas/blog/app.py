import json
import boto3
import os
from botocore.exceptions import ClientError

dynamodb = boto3.resource('dynamodb')
table_name = os.environ.get('TABLE_NAME', 'hzcode-blog')
table = dynamodb.Table(table_name)

def lambda_handler(event, context):
    path = event.get('path', '')
    http_method = event.get('httpMethod', '')

    try:
        if path == '/api/blog' and http_method == 'GET':
            # List all blogs (a scan for now, secondary index is better for scale, but fine for personal blog)
            response = table.scan()
            items = response.get('Items', [])
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps(items)
            }
        
        elif path.startswith('/api/blog/') and http_method == 'GET':
            # Get detail by slug
            slug = event['pathParameters'].get('slug')
            response = table.get_item(Key={'slug': slug})
            item = response.get('Item')
            
            if item:
                return {
                    'statusCode': 200,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps(item)
                }
            else:
                return {
                    'statusCode': 404,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps({'message': 'Blog post not found'})
                }
                
        elif path == '/api/blog' and http_method == 'POST':
            # Admin create/edit blog post
            headers = {k.lower(): v for k, v in event.get('headers', {}).items()}
            auth_header = headers.get('authorization', '')
            admin_secret = os.environ.get('ADMIN_SECRET', 'admin123')
            
            if auth_header != f"Bearer {admin_secret}":
                return {
                    'statusCode': 401,
                    'headers': {'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'message': 'Unauthorized'})
                }
                
            body = json.loads(event.get('body', '{}'))
            slug = body.get('slug')
            if not slug:
                return {
                    'statusCode': 400,
                    'headers': {'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'message': 'Slug is required'})
                }
                
            table.put_item(Item=body)
            return {
                'statusCode': 201,
                'headers': {'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'message': 'Blog saved successfully'})
            }

        elif path.startswith('/api/blog/') and http_method == 'DELETE':
            # Admin delete blog post
            headers = {k.lower(): v for k, v in event.get('headers', {}).items()}
            auth_header = headers.get('authorization', '')
            admin_secret = os.environ.get('ADMIN_SECRET', 'admin123')
            
            if auth_header != f"Bearer {admin_secret}":
                return {
                    'statusCode': 401,
                    'headers': {'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'message': 'Unauthorized'})
                }
                
            slug = event['pathParameters'].get('slug')
            table.delete_item(Key={'slug': slug})
            return {
                'statusCode': 200,
                'headers': {'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'message': 'Blog deleted'})
            }
                
    except ClientError as e:
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
