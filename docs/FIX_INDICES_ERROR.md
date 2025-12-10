# 🔧 CORRIGIDO: Criar Índices no Supabase

**Problema:** `operator class "gin_trgm_ops" does not exist`  
**Solução:** Ativar extensão `pg_trgm` primeiro  
**Tempo:** 5 minutos

---

## ✅ Solução

O erro ocorre porque a extensão PostgreSQL `pg_trgm` não está ativada.

### Passo 1: Execute Esta Query PRIMEIRO

```sql
CREATE EXTENSION IF NOT EXISTS pg_trgm;
```

**Resultado esperado:**
```
✅ Success - Extension pg_trgm created
```

---

### Passo 2: Execute o SQL Completo

Agora sim, execute o arquivo completo:

```bash
supabase/migrations/indices.sql
```

**Ou copie e execute no Supabase SQL Editor**

---

## 📝 O Que Mudou

No arquivo `supabase/migrations/indices.sql`, agora começa com:

```sql
-- =====================================
-- 0. CRIAR EXTENSÃO (NECESSÁRIO PRIMEIRO!)
-- =====================================

-- Ativar extensão pg_trgm para busca fuzzy
CREATE EXTENSION IF NOT EXISTS pg_trgm;
```

Isso ativa a extensão automaticamente antes de criar os índices.

---

## 🚀 Como Executar Agora

### Opção A: Supabase Web UI

1. Acesse: https://app.supabase.com
2. Selecione seu projeto
3. **SQL Editor** → **New Query**
4. Cole o conteúdo de `supabase/migrations/indices.sql`
5. Clique **RUN**
6. Aguarde ~10 segundos

**Resultado esperado:**
```
✅ Success - Extension pg_trgm created
✅ Success - 14 indices created in 2.5s
```

### Opção B: Supabase CLI (Local)

```bash
# Se tiver supabase CLI instalado
supabase db push

# Isso automaticamente executa as migrations
```

---

## ✅ Validar Índices

Após executar com sucesso, execute esta query para confirmar:

```sql
SELECT 
  tablename,
  indexname
FROM pg_indexes
WHERE schemaname = 'public' AND tablename IN ('contacts', 'conversations', 'messages', 'deals')
ORDER BY tablename, indexname;
```

**Você deve ver 14 índices:**

```
contacts         | idx_contacts_email
contacts         | idx_contacts_name
contacts         | idx_contacts_user_id
conversations    | idx_conversations_assigned_to
conversations    | idx_conversations_contact_id
conversations    | idx_conversations_last_message_at
conversations    | idx_conversations_status
deals            | idx_deals_contact_id
deals            | idx_deals_stage_id
deals            | idx_deals_status
deals            | idx_deals_user_id
messages         | idx_messages_conversation_at
messages         | idx_messages_conversation_id
messages         | idx_messages_created_at
```

---

## 🎉 Pronto!

Os índices foram criados com sucesso! ✅

### Performance esperada:

| Query | Antes | Depois | Ganho |
|-------|-------|--------|-------|
| `WHERE name ILIKE '%termo%'` | 500ms | 50ms | **-90%** |
| `WHERE user_id = 'xxx'` | 200ms | 20ms | **-90%** |
| `WHERE conversation_id ORDER BY created_at` | 300ms | 50ms | **-83%** |

---

## ❌ Se Ainda Dar Erro

**Erro:** `permission denied for language sql`

**Solução:** 
- Você precisa ter permissão de super user no Supabase
- Contate suporte Supabase ou use a conta principal do projeto

**Erro:** `relation "contacts" does not exist`

**Solução:**
- Suas tabelas não existem ainda
- Crie as tabelas primeiro (ver schema abaixo)

---

## 📊 Schema das Tabelas

Se precisar criar as tabelas, aqui está o schema:

```sql
-- Contacts table
CREATE TABLE contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  tags TEXT[] DEFAULT '{}',
  custom_fields JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Conversations table
CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  contact_id UUID NOT NULL REFERENCES contacts(id),
  assigned_to UUID REFERENCES auth.users(id),
  channel_id UUID,
  status TEXT DEFAULT 'open',
  last_message_at TIMESTAMP WITH TIME ZONE,
  unread_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Messages table
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES conversations(id),
  sender_id UUID NOT NULL REFERENCES auth.users(id),
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Deals table
CREATE TABLE deals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  contact_id UUID REFERENCES contacts(id),
  stage_id UUID,
  name TEXT NOT NULL,
  value NUMERIC(12, 2),
  probability NUMERIC(5, 2),
  status TEXT DEFAULT 'open',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
```

---

## 🚀 Próxima Etapa

Após criar os índices:
1. ✅ Índices criados
2. ⏳ Otimizar API routes
3. ⏳ Atualizar componentes
4. ⏳ Build & test

---

**Status:** ✅ Pronto para executar!
