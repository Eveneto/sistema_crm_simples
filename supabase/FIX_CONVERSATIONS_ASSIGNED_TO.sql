-- ============================================
-- FIX: Atualizar conversas com assigned_to = NULL
-- ============================================
-- Execute este script no SQL Editor do Supabase

-- Verificar quantas conversas têm assigned_to = NULL
SELECT 
  COUNT(*) as total_null,
  COUNT(DISTINCT contact_id) as total_contacts
FROM conversations
WHERE assigned_to IS NULL;

-- Obter o primeiro usuário da tabela auth.users
-- (ou você pode especificar um UUID específico)
SELECT id, email FROM auth.users LIMIT 1;

-- ============================================
-- Opção 1: Atribuir a um usuário específico
-- (Substitua 'SEU_USER_ID_AQUI' pelo UUID real)
-- ============================================
UPDATE conversations
SET assigned_to = 'SEU_USER_ID_AQUI'::uuid
WHERE assigned_to IS NULL;

-- Verificar se funcionou
SELECT 
  COUNT(*) as total_atribuidas,
  COUNT(DISTINCT assigned_to) as total_usuarios
FROM conversations
WHERE assigned_to IS NOT NULL;

-- Ver algumas das conversas atualizadas
SELECT 
  id,
  contact_id,
  assigned_to,
  status,
  created_at
FROM conversations
WHERE assigned_to IS NOT NULL
ORDER BY updated_at DESC
LIMIT 10;
