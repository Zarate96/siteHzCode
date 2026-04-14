import json
import boto3
import os
import jwt
import hashlib
import time
from botocore.exceptions import ClientError

dynamodb = boto3.resource('dynamodb')
table_name = os.environ.get('TABLE_NAME', 'hzcode-admin')
table = dynamodb.Table(table_name)
jwt_secret = os.environ.get('JWT_SECRET', 'my-super-secret-jwt-key')

def verify_password(stored_hash, password):
    try:
        salt_hex, key_hex = stored_hash.split(':')
        salt = bytes.fromhex(salt_hex)
        key = bytes.fromhex(key_hex)
        new_key = hashlib.scrypt(password.encode('utf-8'), salt=salt, n=16384, r=8, p=1, maxmem=33554432, dklen=32)
        return key == new_key
    except Exception as e:
        print(f"Error checking password: {e}")
        return False

def lambda_handler(event, context):
    if event.get('httpMethod') == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type,Authorization',
                'Access-Control-Allow-Methods': 'OPTIONS,POST,GET'
            },
            'body': ''
        }

    try:
        body = json.loads(event.get('body', '{}'))
        username = body.get('username')
        password = body.get('password')

        if not username or not password:
            return {
                'statusCode': 400,
                'headers': {'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'message': 'Username and password required'})
            }

        response = table.get_item(Key={'username': username})
        item = response.get('Item')

        if not item or not verify_password(item['password_hash'], password):
            return {
                'statusCode': 401,
                'headers': {'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'message': 'Invalid credentials'})
            }

        # Generate JWT (expire in 24 hours)
        payload = {
            'sub': username,
            'exp': int(time.time()) + (24 * 60 * 60)
        }
        token = jwt.encode(payload, jwt_secret, algorithm='HS256')

        return {
            'statusCode': 200,
            'headers': {'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({
                'message': 'Login successful',
                'token': token
            })
        }

    except ClientError as e:
        print(f"DynamoDB Error: {e}")
        return {
            'statusCode': 500,
            'headers': {'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Internal server error'})
        }
    except Exception as e:
        print(f"General Error: {e}")
        return {
            'statusCode': 400,
            'headers': {'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'message': 'Bad request'})
        }
