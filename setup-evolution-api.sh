#!/bin/bash

# 🚀 SETUP EVOLUTION API - VERSÃO AUTOMÁTICA

echo "🚀 Iniciando Evolution API..."
echo ""

# Parar containers anteriores
docker stop evolution_api evolution_postgres 2>/dev/null
docker rm evolution_api evolution_postgres 2>/dev/null

# 1. Rodar PostgreSQL
echo "📦 Iniciando PostgreSQL..."
docker run -d \
  --name evolution_postgres \
  -e POSTGRES_USER=evolution \
  -e POSTGRES_PASSWORD=evolution_pass_123 \
  -e POSTGRES_DB=evolution \
  -p 5434:5432 \
  -v evolution_db_data:/var/lib/postgresql/data \
  postgres:15-alpine

sleep 10
echo "✅ PostgreSQL iniciado em localhost:5434"
echo ""

# 2. Rodar Evolution API
echo "🚀 Iniciando Evolution API..."
docker run -d \
  --name evolution_api \
  --link evolution_postgres:postgres \
  -p 8080:8080 \
  -e AUTHENTICATION_API_KEY=mude-me \
  -e DATABASE_PROVIDER=postgres \
  -e DATABASE_CONNECTION_URI="postgresql://evolution:evolution_pass_123@evolution_postgres:5432/evolution" \
  -e DATABASE_URL="postgres://evolution:evolution_pass_123@evolution_postgres:5432/evolution" \
  atendai/evolution-api:latest

sleep 20
echo "✅ Evolution API iniciado"
echo ""

# 3. Testar
echo "🧪 Testando Evolution API..."
RESPONSE=$(curl -s http://localhost:8080)

if echo "$RESPONSE" | grep -q "Welcome"; then
  echo "✅ Evolution API respondendo!"
  echo ""
  echo "📊 Response:"
  echo "$RESPONSE" | head -20
else
  echo "❌ Evolution API não respondeu"
  echo ""
  echo "📋 Logs:"
  docker logs evolution_api | tail -20
fi

echo ""
echo "═══════════════════════════════════════════════════════"
echo ""
echo "🎯 URLs IMPORTANTES:"
echo "  • Evolution API: http://localhost:8080"
echo "  • Evolution Manager: http://localhost:8080/manager"
echo "  • Evolution Swagger: http://localhost:8080/docs"
echo ""
echo "🔑 AUTENTICAÇÃO:"
echo "  • API Key: mude-me"
echo ""
echo "📚 PRÓXIMOS PASSOS:"
echo "  1. Seu CRM: npm run dev"
echo "  2. Acessar: http://localhost:3001/channels/whatsapp"
echo "  3. QR Code aparecerá automaticamente"
echo ""
echo "═══════════════════════════════════════════════════════"
