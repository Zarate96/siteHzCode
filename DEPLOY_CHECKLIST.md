# Checklist de Deploy — Chatbot hzcode.mx

Pasos manuales que se hacen **una sola vez** antes del primer push.

---

## 1. Crear API Key en OpenAI

1. Ir a [platform.openai.com/api-keys](https://platform.openai.com/api-keys)
2. Clic en **"Create new secret key"**
3. Nombre sugerido: `hzcode-chatbot-prod`
4. Copiar la key inmediatamente (solo se muestra una vez): `sk-proj-...`
5. Guardarla temporalmente en un lugar seguro (solo mientras la agregas a GitHub)

> ⚠️ No guardes la key en ningún archivo del repositorio.

---

## 2. Agregar el Secret en GitHub Actions

1. Ir a: `github.com/<tu-usuario>/siteHzCode` → **Settings** → **Secrets and variables** → **Actions**
2. Clic en **"New repository secret"**
3. Configurar:
   - **Name:** `OPENAI_API_KEY`
   - **Secret:** pegar la key copiada en el paso anterior
4. Clic en **"Add secret"**

Los secrets actuales que deben existir para que el deploy funcione completo:

| Secret | Para qué se usa |
|--------|----------------|
| `AWS_ACCESS_KEY_ID` | Credenciales AWS (ya existe) |
| `AWS_SECRET_ACCESS_KEY` | Credenciales AWS (ya existe) |
| `IONOS_SMTP_PASS` | Email de contacto (ya existe) |
| `RECAPTCHA_SECRET_KEY` | reCAPTCHA (ya existe) |
| `NEXT_PUBLIC_API_URL` | URL del API Gateway (ya existe) |
| `OPENAI_API_KEY` | ← **NUEVO** — chatbot |

---

## 3. Hacer el Deploy

Con el secret configurado, el deploy es automático:

```bash
git add .
git commit -m "feat: add chatbot — lambda + widget"
git push origin master
```

GitHub Actions ejecutará:
1. `sam build` — empaqueta la nueva `ChatbotFunction` junto a las existentes
2. `sam deploy` — actualiza el stack `hzcode-backend` en CloudFormation con el nuevo parámetro
3. `npm run build` — compila el frontend con el `ChatWidget` incluido
4. `aws s3 sync` — sube el build estático a S3
5. `aws cloudfront create-invalidation` — invalida el CDN para que los visitantes reciban el JS actualizado

El pipeline tarda aproximadamente **3-5 minutos** en completarse.

---

## 4. Obtener la URL del endpoint después del deploy

Una vez que CloudFormation termine, el endpoint del chatbot es:

```
POST https://<api-id>.execute-api.us-east-1.amazonaws.com/Prod/api/chatbot
```

Para obtener la URL exacta del API Gateway:

```bash
aws cloudformation describe-stacks \
  --stack-name hzcode-backend \
  --query "Stacks[0].Outputs[?OutputKey=='ApiEndpoint'].OutputValue" \
  --output text \
  --region us-east-1
```

---

## 5. Pruebas manuales del endpoint

Reemplaza `<API_URL>` con el valor obtenido en el paso anterior (sin `/` al final).

### 5a. Test básico — pregunta sobre servicios

```bash
curl -s -X POST "<API_URL>/api/chatbot" \
  -H "Content-Type: application/json" \
  -d '{"message": "¿Qué servicios ofreces?", "history": [], "sessionId": "test-001"}' | python -m json.tool
```

Respuesta esperada:
```json
{
  "response": "Ofrezco principalmente tres tipos de servicios..."
}
```

### 5b. Test de tiempos — pregunta sobre plazos

```bash
curl -s -X POST "<API_URL>/api/chatbot" \
  -H "Content-Type: application/json" \
  -d '{"message": "¿Cuánto tiempo tarda un proyecto?", "history": [], "sessionId": "test-002"}' | python -m json.tool
```

### 5c. Test de contacto — cómo contratar

```bash
curl -s -X POST "<API_URL>/api/chatbot" \
  -H "Content-Type: application/json" \
  -d '{"message": "¿Cómo puedo contactarte para iniciar un proyecto?", "history": [], "sessionId": "test-003"}' | python -m json.tool
```

Debe mencionar `hzcode.mx/cotizacion` o `hugo.zarate@hzcode.mx`.

### 5d. Test de guardrail — pregunta fuera de alcance

```bash
curl -s -X POST "<API_URL>/api/chatbot" \
  -H "Content-Type: application/json" \
  -d '{"message": "¿Cuál es el pronóstico del clima para mañana?", "history": [], "sessionId": "test-004"}' | python -m json.tool
```

El bot debe declinar con cortesía y redirigir al formulario de contacto.

### 5e. Test de conversación con historial

```bash
curl -s -X POST "<API_URL>/api/chatbot" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "¿Y cuánto costaría aproximadamente?",
    "history": [
      {"role": "user", "content": "¿Haces landing pages?"},
      {"role": "assistant", "content": "Sí, desarrollo landing pages profesionales con React y Next.js. El tiempo típico es de 1 a 2 semanas."}
    ],
    "sessionId": "test-005"
  }' | python -m json.tool
```

El bot debe entender que la pregunta de precio se refiere a landing pages (contexto del historial).

### 5f. Test de validación — cuerpo vacío

```bash
curl -s -X POST "<API_URL>/api/chatbot" \
  -H "Content-Type: application/json" \
  -d '{"message": "", "history": [], "sessionId": "test-006"}' | python -m json.tool
```

Respuesta esperada: `{"error": "\"message\" field is required"}` con status 400.

### 5g. Test CORS preflight

```bash
curl -s -X OPTIONS "<API_URL>/api/chatbot" \
  -H "Origin: https://hzcode.mx" \
  -H "Access-Control-Request-Method: POST" \
  -v 2>&1 | grep -E "< HTTP|Access-Control"
```

Debe responder `200` con headers `Access-Control-Allow-*`.

---

## 6. Verificar logs en CloudWatch

Si algo falla, revisar los logs de la lambda:

```bash
aws logs tail /aws/lambda/hzcode-backend-ChatbotFunction-XXXXXXXXXXXX \
  --follow \
  --region us-east-1
```

O en la consola AWS: **CloudWatch → Log groups → `/aws/lambda/hzcode-backend-ChatbotFunction-*`**

Buscar en los logs:
- `[CHATBOT] session=... tokens_used=...` — confirma que OpenAI respondió correctamente
- `[CHATBOT] OpenAI error:` — indica problema con la API key o cuota

---

## Definition of Done — Chatbot listo para producción

### Backend
- [ ] Lambda `ChatbotFunction` visible en AWS Console → Lambda
- [ ] Endpoint `POST /Prod/api/chatbot` responde `200` con `{"response": "..."}`
- [ ] Endpoint responde `400` si `message` está vacío
- [ ] Logs de CloudWatch muestran `tokens_used` (confirma que llega a OpenAI)
- [ ] `OPENAI_API_KEY` **no** aparece en ningún archivo del repo ni en los logs

### Frontend
- [ ] Burbuja dorada aparece en la esquina inferior derecha en todas las páginas
- [ ] El chat se abre y cierra con animación suave
- [ ] El historial se mantiene durante la sesión de navegación
- [ ] El spinner aparece mientras espera respuesta del bot
- [ ] Los errores de red muestran mensaje amigable (no stacktrace)
- [ ] Funciona en mobile (responsive, no oculta contenido crítico)

### Seguridad
- [ ] `OPENAI_API_KEY` solo existe como GitHub Secret
- [ ] El parámetro SAM tiene `NoEcho: true`
- [ ] No hay keys hardcodeadas en `app.py`, `template.yaml`, ni en ningún commit del historial de git
