#!/bin/bash

# 🧪 SCRIPT DE TESTE RÁPIDO - WhatsApp Integration

set -e

echo "🧪 TESTE DE INTEGRAÇÃO WhatsApp"
echo "================================"
echo ""

# Cores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuração
WEBHOOK_TOKEN="${EVOLUTION_WEBHOOK_TOKEN:-your_webhook_token_change_this}"
CRM_URL="${NEXT_PUBLIC_APP_URL:-http://localhost:3001}"
EVOLUTION_URL="${EVOLUTION_API_URL:-http://localhost:3000}"

echo "Configuração:"
echo "  CRM URL: $CRM_URL"
echo "  Evolution API: $EVOLUTION_URL"
echo "  Webhook Token: ${WEBHOOK_TOKEN:0:10}..."
echo ""

# Test 1: Webhook Health Check
echo -e "${YELLOW}[1/5] Verificando Health Check do Webhook...${NC}"
WEBHOOK_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$CRM_URL/api/webhook/whatsapp")
if [ "$WEBHOOK_STATUS" -eq 200 ]; then
    echo -e "${GREEN}✅ Webhook OK (Status: $WEBHOOK_STATUS)${NC}"
else
    echo -e "${RED}❌ Webhook falhou (Status: $WEBHOOK_STATUS)${NC}"
fi
echo ""

# Test 2: Send API Health Check
echo -e "${YELLOW}[2/5] Verificando Health Check do Send API...${NC}"
SEND_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$CRM_URL/api/whatsapp/send")
if [ "$SEND_STATUS" -eq 200 ]; then
    echo -e "${GREEN}✅ Send API OK (Status: $SEND_STATUS)${NC}"
else
    echo -e "${RED}❌ Send API falhou (Status: $SEND_STATUS)${NC}"
fi
echo ""

# Test 3: Webhook with Valid Token
echo -e "${YELLOW}[3/5] Testando Webhook com token válido...${NC}"
WEBHOOK_RESPONSE=$(curl -s -X POST "$CRM_URL/api/webhook/whatsapp" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $WEBHOOK_TOKEN" \
  -d '{
    "event": "messages.upsert",
    "instance": "crm_instance",
    "data": {
      "messageTimestamp": '$(date +%s)',
      "messageType": "text",
      "textMessage": {"text": "Teste de webhook"},
      "fromMe": false,
      "sender": {"id": "5511987654321@c.us", "name": "Teste"},
      "chat": {"id": "5511987654321@c.us"}
    }
  }' -w '\n%{http_code}')

WEBHOOK_HTTP_CODE=$(echo "$WEBHOOK_RESPONSE" | tail -1)
WEBHOOK_BODY=$(echo "$WEBHOOK_RESPONSE" | head -n -1)

if [ "$WEBHOOK_HTTP_CODE" -eq 200 ]; then
    echo -e "${GREEN}✅ Webhook aceito (Status: $WEBHOOK_HTTP_CODE)${NC}"
    echo "Response: $WEBHOOK_BODY"
else
    echo -e "${RED}❌ Webhook rejeitado (Status: $WEBHOOK_HTTP_CODE)${NC}"
    echo "Response: $WEBHOOK_BODY"
fi
echo ""

# Test 4: Webhook with Invalid Token
echo -e "${YELLOW}[4/5] Testando Webhook com token inválido (deve falhar)...${NC}"
INVALID_RESPONSE=$(curl -s -X POST "$CRM_URL/api/webhook/whatsapp" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer invalid_token" \
  -d '{"event":"test","instance":"test","data":{}}' \
  -w '\n%{http_code}')

INVALID_HTTP_CODE=$(echo "$INVALID_RESPONSE" | tail -1)

if [ "$INVALID_HTTP_CODE" -eq 401 ]; then
    echo -e "${GREEN}✅ Corretamente rejeitado (Status: $INVALID_HTTP_CODE)${NC}"
else
    echo -e "${RED}❌ Deveria ser 401, recebeu: $INVALID_HTTP_CODE${NC}"
fi
echo ""

# Test 5: Send Message API with Invalid Payload
echo -e "${YELLOW}[5/5] Testando Send API com payload inválido (deve falhar)...${NC}"
INVALID_SEND=$(curl -s -X POST "$CRM_URL/api/whatsapp/send" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer test" \
  -d '{"phoneNumber":"invalid","message":"test"}' \
  -w '\n%{http_code}')

INVALID_SEND_CODE=$(echo "$INVALID_SEND" | tail -1)

if [ "$INVALID_SEND_CODE" -eq 400 ]; then
    echo -e "${GREEN}✅ Corretamente rejeitado (Status: $INVALID_SEND_CODE)${NC}"
else
    echo -e "${RED}❌ Deveria ser 400, recebeu: $INVALID_SEND_CODE${NC}"
fi
echo ""

# Summary
echo "================================"
echo -e "${GREEN}✅ Testes de API concluídos!${NC}"
echo ""
echo "Próximos passos:"
echo "1. Rodar: docker-compose up -d"
echo "2. Ir para: $CRM_URL/channels/whatsapp"
echo "3. Escanear QR Code"
echo "4. Enviar mensagem de teste"
echo ""
