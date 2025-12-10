# 🔍 Verificar Schema do Banco de Dados

## Problema
O SQL pode referenciar colunas que não existem. Antes de executar `indices.sql`, precisamos verificar o schema real.

## ✅ Passo 1: Executar Query de Diagnóstico

Cole esta query NO SUPABASE SQL EDITOR e execute:

```sql
-- ===== DIAGNÓSTICO COMPLETO =====

-- 1. TABELA: CONTACTS
SELECT 
  'contacts' as tabela,
  column_name,
  data_type,
  is_nullable,
  ordinal_position
FROM information_schema.columns 
WHERE table_name = 'contacts'
ORDER BY ordinal_position;

-- 2. TABELA: CONVERSATIONS
SELECT 
  'conversations' as tabela,
  column_name,
  data_type,
  is_nullable,
  ordinal_position
FROM information_schema.columns 
WHERE table_name = 'conversations'
ORDER BY ordinal_position;

-- 3. TABELA: MESSAGES
SELECT 
  'messages' as tabela,
  column_name,
  data_type,
  is_nullable,
  ordinal_position
FROM information_schema.columns 
WHERE table_name = 'messages'
ORDER BY ordinal_position;

-- 4. TABELA: DEALS
SELECT 
  'deals' as tabela,
  column_name,
  data_type,
  is_nullable,
  ordinal_position
FROM information_schema.columns 
WHERE table_name = 'deals'
ORDER BY ordinal_position;
```

## 📋 Passo 2: Documentar Resultados

Copie aqui os resultados que você vê:

### CONTACTS
```
column_name | data_type | is_nullable
-------|----------|----------
[COLE AQUI]
```

### CONVERSATIONS
```
column_name | data_type | is_nullable
-------|----------|----------
[COLE AQUI]
```

### MESSAGES
```
column_name | data_type | is_nullable
-------|----------|----------
[COLE AQUI]
```

### DEALS
```
column_name | data_type | is_nullable
-------|----------|----------
[COLE AQUI]
```

## 🛠️ Passo 3: Validação

Depois de ter os resultados, vamos validar se essas colunas estão no nosso SQL:

### Índices esperados em CONTACTS
- [ ] `user_id` - REQUIRED
- [ ] `name` - REQUIRED (para gin_trgm_ops)
- [ ] `email` - REQUIRED

### Índices esperados em CONVERSATIONS
- [ ] `assigned_to` - REQUIRED
- [ ] `contact_id` - REQUIRED
- [ ] `status` - REQUIRED
- [ ] `last_message_at` - REQUIRED

### Índices esperados em MESSAGES
- [ ] `conversation_id` - REQUIRED
- [ ] `created_at` - REQUIRED
- [ ] `sender_id` - OPTIONAL (pode remover se não existir)

### Índices esperados em DEALS
- [ ] `user_id` - REQUIRED
- [ ] `stage_id` - REQUIRED
- [ ] `contact_id` - REQUIRED
- [ ] `status` - REQUIRED

## ⚠️ Se alguma coluna não existir

Avise para que eu corrija o `indices.sql` ANTES de executar!

## ✨ Depois de Confirmar

Você pode:
1. Executar `indices.sql` com confiança
2. Ou me mandar o output para eu corrigir antes

