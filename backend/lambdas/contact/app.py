import json
import boto3
import os
import uuid
import datetime
import jwt
import smtplib
import urllib.request
import urllib.parse
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from botocore.exceptions import ClientError

dynamodb = boto3.resource('dynamodb')
table_name = os.environ.get('TABLE_NAME', 'hzcode-messages')
table = dynamodb.Table(table_name)

# SMTP Configuration (IONOS)
SMTP_HOST = 'smtp.ionos.com'
SMTP_PORT = 587
SMTP_USER = os.environ.get('SMTP_USER', 'hugo.zarate@hzcode.mx')
SMTP_PASS = os.environ.get('SMTP_PASS', '')

def send_email(to_email, subject, html_body):
    """Send an email via IONOS SMTP. Fails silently so form submission is never blocked."""
    import sys
    print(f"[EMAIL] Attempting to send email to: {to_email}", flush=True)
    print(f"[EMAIL] SMTP_USER={SMTP_USER}, SMTP_PASS={'SET(' + str(len(SMTP_PASS)) + ' chars)' if SMTP_PASS else 'EMPTY'}", flush=True)
    
    if not SMTP_PASS:
        print("[EMAIL] SMTP_PASS not configured, skipping email", flush=True)
        return False
    try:
        msg = MIMEMultipart('alternative')
        msg['From'] = f'HzCode <{SMTP_USER}>'
        msg['To'] = to_email
        msg['Subject'] = subject
        msg.attach(MIMEText(html_body, 'html', 'utf-8'))
        
        print(f"[EMAIL] Connecting to {SMTP_HOST}:{SMTP_PORT}...", flush=True)
        with smtplib.SMTP(SMTP_HOST, SMTP_PORT, timeout=10) as server:
            server.set_debuglevel(1)  # This logs full SMTP conversation
            print("[EMAIL] Connected. Starting TLS...", flush=True)
            server.starttls()
            print("[EMAIL] TLS established. Logging in...", flush=True)
            server.login(SMTP_USER, SMTP_PASS)
            print("[EMAIL] Logged in. Sending...", flush=True)
            result = server.sendmail(SMTP_USER, to_email, msg.as_string())
            print(f"[EMAIL] Send result: {result}", flush=True)
        print(f"[EMAIL] SUCCESS - Email sent to {to_email}", flush=True)
        return True
    except Exception as e:
        import traceback
        print(f"[EMAIL] FAILED: {type(e).__name__}: {e}", flush=True)
        print(f"[EMAIL] Traceback: {traceback.format_exc()}", flush=True)
        return False

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
            
            # reCAPTCHA v3 validation
            recaptcha_token = body.get('recaptcha_token')
            recaptcha_secret = os.environ.get('RECAPTCHA_SECRET_KEY')
            if recaptcha_secret and recaptcha_token:
                try:
                    verify_url = 'https://www.google.com/recaptcha/api/siteverify'
                    data = urllib.parse.urlencode({'secret': recaptcha_secret, 'response': recaptcha_token}).encode('utf-8')
                    req = urllib.request.Request(verify_url, data=data)
                    with urllib.request.urlopen(req, timeout=5) as response:
                        result = json.loads(response.read().decode())
                        if not result.get('success') or result.get('score', 0) < 0.5:
                            print(f"reCAPTCHA failed: {result}")
                            return {
                                'statusCode': 400,
                                'headers': {'Access-Control-Allow-Origin': '*'},
                                'body': json.dumps({'message': 'reCAPTCHA verification failed'})
                            }
                except Exception as e:
                    print(f"reCAPTCHA verification error: {e}")
            elif recaptcha_secret and not recaptcha_token:
                return {
                    'statusCode': 400,
                    'headers': {'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'message': 'Missing reCAPTCHA token'})
                }
            
            item_id = str(uuid.uuid4())
            timestamp = datetime.datetime.utcnow().isoformat()
            customer_name = body.get('name')
            customer_email = body.get('email')
            subject = body.get('subject', 'Sin asunto')
            phone = body.get('phone', '')
            message = body.get('message')
            
            item = {
                'id': item_id,
                'fecha': timestamp,
                'nombre': customer_name,
                'email': customer_email,
                'asunto': subject,
                'telefono': phone,
                'mensaje': message,
                'is_answered': False
            }
            
            table.put_item(Item=item)
            
            # ── Email 1: Auto-reply to customer ──
            customer_html = f"""
            <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0d1117; color: #e6edf3; border-radius: 12px; overflow: hidden;">
                <div style="background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); padding: 32px; text-align: center;">
                    <h1 style="color: #b8966b; margin: 0; font-size: 28px;">HzCode</h1>
                    <p style="color: #8b949e; margin-top: 8px;">Soluciones Web &amp; Cloud</p>
                </div>
                <div style="padding: 32px;">
                    <h2 style="color: #e6edf3; margin-top: 0;">¡Hola {customer_name}!</h2>
                    <p style="color: #8b949e; font-size: 16px; line-height: 1.6;">
                        Gracias por tu interés en nuestros servicios. Hemos recibido tu mensaje
                        y pronto estaremos en contacto contigo.
                    </p>
                    <div style="background: #161b22; border: 1px solid #30363d; border-radius: 8px; padding: 16px; margin: 24px 0;">
                        <p style="color: #8b949e; margin: 0 0 8px 0; font-size: 13px;">Tu mensaje:</p>
                        <p style="color: #e6edf3; margin: 0; font-style: italic;">"{message}"</p>
                    </div>
                    <p style="color: #8b949e; font-size: 14px;">
                        Si tienes alguna pregunta adicional, no dudes en responder a este correo.
                    </p>
                </div>
                <div style="background: #161b22; padding: 20px; text-align: center; border-top: 1px solid #30363d;">
                    <p style="color: #484f58; font-size: 12px; margin: 0;">
                        © {datetime.datetime.utcnow().year} HzCode — hzcode.mx
                    </p>
                </div>
            </div>
            """
            send_email(customer_email, 'HzCode — Hemos recibido tu mensaje', customer_html)
            
            # ── Email 2: Notification to admin ──
            admin_html = f"""
            <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #b8966b;">📩 Nueva Cotización Recibida</h2>
                <table style="width: 100%; border-collapse: collapse;">
                    <tr><td style="padding: 8px; font-weight: bold; color: #555;">Nombre:</td><td style="padding: 8px;">{customer_name}</td></tr>
                    <tr><td style="padding: 8px; font-weight: bold; color: #555;">Email:</td><td style="padding: 8px;">{customer_email}</td></tr>
                    <tr><td style="padding: 8px; font-weight: bold; color: #555;">Teléfono:</td><td style="padding: 8px;">{phone or 'No proporcionado'}</td></tr>
                    <tr><td style="padding: 8px; font-weight: bold; color: #555;">Asunto:</td><td style="padding: 8px;">{subject}</td></tr>
                </table>
                <div style="background: #f5f5f5; padding: 16px; border-radius: 8px; margin-top: 16px;">
                    <p style="color: #333; margin: 0; white-space: pre-wrap;">{message}</p>
                </div>
                <p style="color: #999; font-size: 12px; margin-top: 20px;">Gestiona este mensaje desde tu panel de administración en hzcode.mx/hzadmin</p>
            </div>
            """
            send_email(SMTP_USER, f'[HzCode] Nueva cotización: {subject}', admin_html)
            
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
