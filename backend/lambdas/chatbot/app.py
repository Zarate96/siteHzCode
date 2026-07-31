import json
import os
from openai import OpenAI
from system_prompt import SYSTEM_PROMPT

client = OpenAI(api_key=os.environ.get('OPENAI_API_KEY', ''))

# Máximo de turnos previos del historial que se envían al LLM.
# Cada turno = 1 mensaje user + 1 mensaje assistant.
MAX_HISTORY_TURNS = 10
# Límites de contenido por rol para evitar prompt injection vía historial falso.
# El modelo genera respuestas de máx ~400 tokens ≈ ~1600 chars, así que 2000 es
# suficiente para mensajes reales pero descarta payloads de inyección masivos.
MAX_USER_MSG_LEN = 500      # igual al maxLength del input en el frontend
MAX_ASSISTANT_MSG_LEN = 2000  # cubre respuestas reales del LLM con margen


def lambda_handler(event, context):
    # ------------------------------------------------------------------ #
    # CORS preflight                                                       #
    # ------------------------------------------------------------------ #
    if event.get('httpMethod') == 'OPTIONS':
        return _cors_response(200, {})

    if event.get('httpMethod') != 'POST':
        return _cors_response(405, {'error': 'Method not allowed'})

    # ------------------------------------------------------------------ #
    # Parse body                                                           #
    # ------------------------------------------------------------------ #
    try:
        body = json.loads(event.get('body') or '{}')
    except json.JSONDecodeError:
        return _cors_response(400, {'error': 'Invalid JSON body'})

    user_message = (body.get('message') or '').strip()
    if not user_message:
        return _cors_response(400, {'error': '"message" field is required'})
    if len(user_message) > MAX_USER_MSG_LEN:
        return _cors_response(400, {'error': f'Message too long (max {MAX_USER_MSG_LEN} characters)'})

    # sessionId se recibe pero no se persiste — solo sirve para logs futuros
    session_id = (body.get('sessionId') or 'anonymous')[:64]

    # ------------------------------------------------------------------ #
    # Sanitizar historial enviado por el cliente                          #
    # [{"role": "user"|"assistant", "content": "..."}]                   #
    # Se aplica límite de longitud diferenciado por rol para dificultar   #
    # la inyección de contexto falso a través del historial del cliente.  #
    # ------------------------------------------------------------------ #
    raw_history = body.get('history') or []
    history = []
    for h in raw_history:
        if not isinstance(h, dict):
            continue
        role = h.get('role')
        content = h.get('content')
        if role not in ('user', 'assistant') or not isinstance(content, str):
            continue
        limit = MAX_USER_MSG_LEN if role == 'user' else MAX_ASSISTANT_MSG_LEN
        history.append({'role': role, 'content': content[:limit]})
    history = history[-MAX_HISTORY_TURNS * 2:]

    # ------------------------------------------------------------------ #
    # Construir lista de mensajes para OpenAI                             #
    # ------------------------------------------------------------------ #
    messages = (
        [{'role': 'system', 'content': SYSTEM_PROMPT}]
        + history
        + [{'role': 'user', 'content': user_message}]
    )

    # ------------------------------------------------------------------ #
    # Llamar a OpenAI                                                     #
    # ------------------------------------------------------------------ #
    try:
        print(f'[CHATBOT] session={session_id} history_len={len(history)} msg_preview={user_message[:80]}')
        completion = client.chat.completions.create(
            model='gpt-4o-mini',
            messages=messages,
            max_tokens=400,
            temperature=0.5,
        )
        reply = completion.choices[0].message.content
        print(f'[CHATBOT] session={session_id} tokens_used={completion.usage.total_tokens}')
    except Exception as e:
        print(f'[CHATBOT] OpenAI error: {type(e).__name__}: {e}')
        return _cors_response(502, {
            'error': 'El asistente no está disponible en este momento. Intenta de nuevo en unos segundos.'
        })

    return _cors_response(200, {'response': reply})


# ------------------------------------------------------------------ #
# Helper                                                               #
# ------------------------------------------------------------------ #
def _cors_response(status_code: int, body: dict):
    return {
        'statusCode': status_code,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': 'https://hzcode.mx',
            'Access-Control-Allow-Headers': 'Content-Type',
            'Access-Control-Allow-Methods': 'POST,OPTIONS',
        },
        'body': json.dumps(body, ensure_ascii=False),
    }
