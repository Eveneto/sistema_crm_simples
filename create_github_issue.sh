#!/bin/bash

# Script para criar issue no GitHub sobre o bug na API deals/[id]

echo "🐛 Criando issue no GitHub para o bug na API deals/[id]..."

# Verificar se está autenticado
if ! gh auth status &>/dev/null; then
    echo "❌ Você não está logado no GitHub CLI."
    echo "Execute: gh auth login"
    echo "Depois execute este script novamente."
    exit 1
fi

# Criar o issue
gh issue create \
  --title "🐛 BUG: TypeError em GET /api/deals/[id] quando test=true" \
  --body-file "docs/BUG_API_DEALS_ID_NULL_USER.md" \
  --label "bug,api,high-priority" \
  --assignee "@me"

echo "✅ Issue criado com sucesso!"
echo "📋 Verifique em: https://github.com/Eveneto/sistema_crm_simples/issues"
