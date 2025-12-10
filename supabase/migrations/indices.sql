-- =========================================
-- FASE 2 - TAREFA 1: Criar Índices
-- =========================================
-- Arquivo: indices.sql
-- Objetivo: Criar índices para otimizar queries
-- Tempo estimado: 5 minutos no Supabase
-- =========================================

-- =====================================
-- 1. ÍNDICES PARA CONTATOS
-- =====================================

-- Buscar contatos por nome (full-text search)
-- Permite: ILIKE '%termo%', faster fuzzy search
CREATE INDEX IF NOT EXISTS idx_contacts_name 
ON contacts USING GIN (name gin_trgm_ops);

-- Filtrar contatos por usuário
-- Permite: WHERE user_id = 'xxx'
CREATE INDEX IF NOT EXISTS idx_contacts_user_id 
ON contacts(user_id);

-- Filtrar por email (único)
CREATE INDEX IF NOT EXISTS idx_contacts_email 
ON contacts(email);

-- =====================================
-- 2. ÍNDICES PARA CONVERSAS
-- =====================================

-- Filtrar conversas assignadas ao usuário
-- Permite: WHERE assigned_to = 'xxx'
CREATE INDEX IF NOT EXISTS idx_conversations_assigned_to 
ON conversations(assigned_to);

-- Conversas do contato
-- Permite: WHERE contact_id = 'xxx'
CREATE INDEX IF NOT EXISTS idx_conversations_contact_id 
ON conversations(contact_id);

-- Status da conversa
CREATE INDEX IF NOT EXISTS idx_conversations_status 
ON conversations(status);

-- Últimas mensagens (ordenação)
CREATE INDEX IF NOT EXISTS idx_conversations_last_message_at 
ON conversations(last_message_at DESC);

-- =====================================
-- 3. ÍNDICES PARA MENSAGENS
-- =====================================

-- Mensagens da conversa
-- Permite: WHERE conversation_id = 'xxx'
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id 
ON messages(conversation_id);

-- Ordenar mensagens por data
CREATE INDEX IF NOT EXISTS idx_messages_created_at 
ON messages(created_at DESC);

-- Composite index: conversa + data
-- Permite: SELECT * FROM messages WHERE conversation_id = 'xxx' ORDER BY created_at DESC
CREATE INDEX IF NOT EXISTS idx_messages_conversation_created_at 
ON messages(conversation_id, created_at DESC);

-- =====================================
-- 4. ÍNDICES PARA DEALS/PIPELINE
-- =====================================

-- Deals do usuário
CREATE INDEX IF NOT EXISTS idx_deals_user_id 
ON deals(user_id);

-- Deals por stage (pipeline)
CREATE INDEX IF NOT EXISTS idx_deals_stage_id 
ON deals(stage_id);

-- Deals por contato
CREATE INDEX IF NOT EXISTS idx_deals_contact_id 
ON deals(contact_id);

-- Status do deal
CREATE INDEX IF NOT EXISTS idx_deals_status 
ON deals(status);

-- =====================================
-- 5. VERIFICAR ÍNDICES CRIADOS
-- =====================================
-- Execute esta query após criar os índices:

-- SELECT 
--   schemaname,
--   tablename,
--   indexname,
--   indexdef
-- FROM pg_indexes
-- WHERE schemaname = 'public'
-- ORDER BY tablename, indexname;

-- =========================================
-- IMPACTO ESPERADO
-- =========================================
-- Antes (sem índices):
--   - WHERE name ILIKE '%termo%' = ~500ms
--   - WHERE user_id = 'xxx' = ~200ms
--   - WHERE conversation_id = 'xxx' ORDER BY created_at = ~300ms
--
-- Depois (com índices):
--   - WHERE name ILIKE '%termo%' = ~50ms (-90%)
--   - WHERE user_id = 'xxx' = ~20ms (-90%)
--   - WHERE conversation_id = 'xxx' ORDER BY created_at = ~50ms (-83%)

-- =========================================
-- COMO EXECUTAR NO SUPABASE
-- =========================================
-- 1. Acesse: https://app.supabase.com
-- 2. Selecione seu projeto
-- 3. SQL Editor (lado esquerdo)
-- 4. Clique em "New Query"
-- 5. Cole o conteúdo deste arquivo
-- 6. Clique em "RUN"
-- 7. Aguarde ~10 segundos
-- 8. Verifique a query de verificação acima

-- =========================================
