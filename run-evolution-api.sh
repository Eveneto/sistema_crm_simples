#!/bin/bash

# 🚀 RODAR EVOLUTION API V2 + SEU CRM

echo "╔═══════════════════════════════════════════════════════════╗"
echo "║  🚀 INICIALIZANDO EVOLUTION API V2                      ║"
echo "╚═══════════════════════════════════════════════════════════╝"
echo ""

cd /home/dev_pc/Documentos/crm_simplificado

# 1. Parar containers anteriores
echo "🛑 Parando containers anteriores..."
docker-compose -f docker-compose-evolution-v2.yml down 2>/dev/null

# 2. Rodar docker-compose
echo ""
echo "📦 Iniciando PostgreSQL, Redis e Evolution API..."
docker-compose -f docker-compose-evolution-v2.yml up -d

# 3. Aguardar inicialização
echo ""
echo "⏳ Aguardando inicialização (30 segundos)..."
sleep 30

# 4. Testar Evolution API
echo ""
echo "🧪 Testando Evolution API..."
RESPONSE=$(curl -s http://localhost:8080 2>&1)

if echo "$RESPONSE" | grep -q "Welcome\|status\|message"; then
  echo "✅ Evolution API respondendo!"
  echo ""
  echo "📊 Response:"
  echo "$RESPONSE" | head -20
else
  echo "⏳ Evolution API ainda inicializando..."
  echo ""
  echo "Ver logs com:"
  echo "  docker logs evolution_api"
  echo ""
  echo "Aguarde mais 30-60 segundos e teste novamente"
fi

# 5. Mostrar status dos containers
echo ""
echo "📊 Status dos containers:"
docker ps | grep -E "evolution|NAMES"

echo ""
echo "═══════════════════════════════════════════════════════════"
echo ""
echo "🎯 PRÓXIMOS PASSOS:"
echo ""
echo "1. Evolution API disponível em:"
echo "   ✅ http://localhost:8080"
echo "   ✅ Manager: http://localhost:8080/manager"
echo "   ✅ Docs: http://localhost:8080/docs"
echo ""
echo "2. Seu CRM em outro terminal:"
echo "   npm run dev"
echo ""
echo "3. Acessar página WhatsApp:"
echo "   http://localhost:3001/channels/whatsapp"
echo ""
echo "4. QR Code aparecerá automaticamente!"
echo ""
echo "═══════════════════════════════════════════════════════════"
echo ""
echo "📝 Comandos úteis:"
echo "   Ver logs:     docker logs -f evolution_api"
echo "   Parar tudo:   docker-compose -f docker-compose-evolution-v2.yml down"
echo "   Reiniciar:    docker-compose -f docker-compose-evolution-v2.yml restart"
echo ""
