# ✅ Issue Criado com Sucesso no GitHub

## Status: Issue criado automaticamente via GitHub CLI

**Issue ID:** #4 (e #3 - duplicado)  
**Título:** 🐛 BUG: TypeError em GET /api/deals/[id] quando test=true  
**Labels:** bug  
**Status:** Open  
**Criado em:** 29 de novembro de 2025  

## URL do Issue:
https://github.com/Eveneto/sistema_crm_simples/issues/4

## Arquivos criados/documentação:
- `docs/BUG_API_DEALS_ID_NULL_USER.md` - Documentação completa do bug
- `docs/GITHUB_ISSUE_INSTRUCTIONS.md` - Este arquivo de instruções
- `create_github_issue.sh` - Script para criação automática

## Resumo da Correção Proposta:

Modificar a query do Supabase em `src/app/api/deals/[id]/route.ts` para condicionalmente aplicar o filtro `user_id` apenas quando não estiver em modo de teste:

```typescript
let query = supabase
  .from('deals')
  .select(`...`)
  .eq('id', dealId);

if (!isTest) {
  query = query.eq('user_id', user.id);
}

const { data: deal, error } = await query.single();
```

## Teste de Reprodução:
```bash
curl -s "http://localhost:3000/api/deals/123?test=true"
# Deve retornar: {"deal": {...}} ou {"error": "Negócio não encontrado"}
# Atualmente retorna: {"error": "Erro interno do servidor"}
```
