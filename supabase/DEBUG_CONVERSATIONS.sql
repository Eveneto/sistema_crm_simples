/**
 * DEBUG_CONVERSATIONS.sql
 * 
 * INSTRUÇÕES:
 * 1. Abra: https://supabase.com/dashboard/project/[seu-projeto]/editor
 * 2. Cola este código
 * 3. Execute (clique em "Run")
 * 4. Verifique os resultados
 */

-- ============================================
-- 1. Quantas conversas existem?
-- ============================================
SELECT 
  'Total de conversas' as check,
  COUNT(*) as resultado
FROM conversations;

-- ============================================
-- 2. Conversas com assigned_to preenchido
-- ============================================
SELECT 
  'Conversas com assigned_to' as check,
  COUNT(*) as resultado
FROM conversations
WHERE assigned_to IS NOT NULL;

-- ============================================
-- 3. Conversas com assigned_to vazio
-- ============================================
SELECT 
  'Conversas com assigned_to = NULL' as check,
  COUNT(*) as resultado
FROM conversations
WHERE assigned_to IS NULL;

-- ============================================
-- 4. Ver primeiras 5 conversas
-- ============================================
SELECT 
  id,
  contact_id,
  assigned_to,
  status,
  last_message_at,
  created_at
FROM conversations
LIMIT 5;

-- ============================================
-- 5. Ver usuários autenticados
-- ============================================
SELECT 
  id,
  email,
  created_at
FROM auth.users
LIMIT 5;

-- ============================================
-- 6. Correlacionar conversas com usuários
-- ============================================
SELECT 
  c.id as conversation_id,
  c.contact_id,
  u.id as user_id,
  u.email as assigned_to_email,
  c.status,
  c.created_at
FROM conversations c
LEFT JOIN auth.users u ON c.assigned_to = u.id
LIMIT 10;

-- ============================================
-- 7. Ver contatos das conversas
-- ============================================
SELECT 
  c.id as conversation_id,
  ct.id as contact_id,
  ct.name as contact_name,
  c.status,
  c.last_message_at
FROM conversations c
LEFT JOIN contacts ct ON c.contact_id = ct.id
LIMIT 10;

-- ============================================
-- 8. Verificar RLS policies
-- ============================================
-- Esta query mostra se o RLS está habilitado
SELECT 
  tablename,
  rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('conversations', 'contacts', 'messages', 'auth')
ORDER BY tablename;

-- ============================================
-- 9. Se conversas tiverem assigned_to = NULL,
-- use este comando para popular
-- ============================================
-- DESCOMENTAR APENAS SE NECESSÁRIO!
/*
-- Primeiro, pegar um user_id válido
WITH user_to_assign AS (
  SELECT id FROM auth.users LIMIT 1
)
UPDATE conversations
SET assigned_to = (SELECT id FROM user_to_assign)
WHERE assigned_to IS NULL;
*/

-- ============================================
-- 10. Verificar dados finais após atualizar
-- ============================================
SELECT 
  'Conversas atribuídas após UPDATE' as check,
  COUNT(*) as resultado
FROM conversations
WHERE assigned_to IS NOT NULL;
