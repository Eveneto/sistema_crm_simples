# 🐛 Bug: Query Supabase com auth.users causa erro PGRST100 ao buscar task

## 📋 Descrição do Problema

Ao tentar buscar uma task específica (`GET /api/tasks/[id]`), ocorre erro PGRST100 do Supabase, mesmo após corrigir o código.

## ❌ Erro

```json
{
  "error": {
    "code": "PGRST100",
    "details": "unexpected 'u' expecting 'sum', 'avg', 'count', 'max' or 'min'",
    "message": "failed to parse select parameter (*,deals(id,title,value,stage),contacts(id,name,email,phone),assigned_user:auth.users!assigned_to(id,email))"
  }
}
```

## 🔍 Causa

A query estava tentando fazer join com `auth.users`:

```typescript
assigned_user:auth.users!assigned_to(id,email)
```

Mas o Supabase PostgREST não suporta joins com tabelas do schema `auth`.

## 📍 Localização

- **Arquivo**: `src/app/api/tasks/[id]/route.ts`
- **Função**: `GET` handler (linha ~38)

## ✅ Código Atual (Correto)

```typescript
const { data: task, error } = await supabase
  .from('tasks')
  .select('*, deals(id, title, value, stage), contacts(id, name, email, phone)')
  .eq('id', id)
  .single();
```

## 🤔 Problema Persistente

Apesar do código estar correto, o erro persiste. Possíveis causas:

- Cache do Supabase (views materializadas?)
- Cache no edge/CDN
- Problema com migrations não aplicadas completamente
- TypeScript types gerados pelo Supabase ainda com schema antigo

## 💡 Próximos Passos de Debug

1. Verificar se há views ou functions no Supabase que usem a query antiga
2. Regenerar types do Supabase: `npx supabase gen types typescript`
3. Verificar logs do Supabase Dashboard
4. Testar query direto no SQL Editor do Supabase
5. Limpar cache do projeto: `rm -rf .next node_modules/.cache`

## 💥 Impacto

- ❌ Não é possível visualizar detalhes de uma task
- ❌ Não é possível editar tasks existentes
- ✅ Criar nova task funciona
- ✅ Listar tasks funciona

## 🎯 Prioridade

**Alta** - Bloqueia funcionalidade crítica (US-028)

## 📎 Relacionado

- User Story: US-028 (Tarefas e Lembretes)
- Sprint 3

## Labels

`bug`, `high-priority`, `supabase`, `us-028`
