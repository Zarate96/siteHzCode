import json
import os
from openai import OpenAI
from system_prompt import SYSTEM_PROMPT

client = OpenAI(api_key=os.environ.get('OPENAI_API_KEY', ''))

# Máximo de turnos previos del historial que se envían al LLM.
# Cada turno = 1 mensaje user + 1 mensaje assistant.
MAX_HISTORY_TURNS = 10


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

    # sessionId se recibe pero no se persiste — solo sirve para logs futuros
    session_id = (body.get('sessionId') or 'anonymous')[:64]

    # ------------------------------------------------------------------ #
    # Sanitizar historial enviado por el cliente                          #
    # [{"role": "user"|"assistant", "content": "..."}]                   #
    # ------------------------------------------------------------------ #
    raw_history = body.get('history') or []
    history = [
        {'role': h['role'], 'content': str(h['content'])[:2000]}
        for h in raw_history
        if isinstance(h, dict)
        and h.get('role') in ('user', 'assistant')
        and isinstance(h.get('content'), str)
    ][-MAX_HISTORY_TURNS * 2:]  # limitar a los últimos N turnos (2 msgs por turno)

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
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': 'Content-Type',
            'Access-Control-Allow-Methods': 'POST,OPTIONS',
        },
        'body': json.dumps(body, ensure_ascii=False),
    }
