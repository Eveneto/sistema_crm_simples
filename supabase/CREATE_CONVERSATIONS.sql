-- ============================================
-- SCRIPT: Criar Conversas de Teste
-- ============================================
-- Execute este script no SQL Editor do Supabase
-- https://supabase.com/dashboard/project/YOUR_PROJECT/editor
--
-- ATENÇÃO: Este script cria conversas de teste atribuídas ao seu usuário
-- ============================================

-- 1. Obtenha seu UUID do usuário (execute isto primeiro para descobrir):
-- SELECT id, email FROM auth.users LIMIT 1;
-- Copie o UUID e substitua 'SEU_USER_ID_AQUI' abaixo

-- ============================================
-- OPÇÃO 1: Criar conversas via INSERT direto
-- ============================================

-- Substitua 'SEU_USER_ID_AQUI' pelo seu UUID
INSERT INTO conversations (contact_id, channel_id, assigned_to, status, unread_count, created_at, updated_at)
SELECT 
  id as contact_id,
  'whatsapp' as channel_id,
  'SEU_USER_ID_AQUI'::uuid as assigned_to,
  'open' as status,
  0 as unread_count,
  NOW() as created_at,
  NOW() as updated_at
FROM contacts
WHERE name IN ('João Silva', 'Maria Santos', 'Pedro Oliveira', 'Ana Costa')
ON CONFLICT (contact_id, channel_id) DO NOTHING;

-- ============================================
-- OPÇÃO 2: Verificar conversas criadas
-- ============================================

SELECT 
  c.id,
  c.contact_id,
  ct.name as contact_name,
  c.assigned_to,
  c.channel_id,
  c.status,
  c.created_at
FROM conversations c
LEFT JOIN contacts ct ON c.contact_id = ct.id
WHERE c.assigned_to = 'SEU_USER_ID_AQUI'::uuid
ORDER BY c.created_at DESC;

-- ============================================
-- OPÇÃO 3: Listar todos os contatos (para selecionar quais quer conversa)
-- ============================================

SELECT 
  id,
  name,
  email,
  phone
FROM contacts
ORDER BY created_at DESC
LIMIT 20;

-- ============================================
-- OPÇÃO 4: Criar conversa com contato específico
-- ============================================

INSERT INTO conversations (contact_id, channel_id, assigned_to, status, unread_count)
VALUES (
  (SELECT id FROM contacts WHERE name = 'João Silva' LIMIT 1),
  'whatsapp',
  'SEU_USER_ID_AQUI'::uuid,
  'open',
  0
)
ON CONFLICT (contact_id, channel_id) DO NOTHING;

-- ============================================
-- OPÇÃO 5: Criar conversa com você mesmo
-- ============================================

-- Criar contato "Você" se não existir
INSERT INTO contacts (name, email, phone, tags, created_at, updated_at)
VALUES (
  'Você (Teste)',
  'voce@test.local',
  '(11) 99999-9999',
  ARRAY['teste', 'self'],
  NOW(),
  NOW()
)
ON CONFLICT (email) DO NOTHING;

-- Criar conversa consigo mesmo
INSERT INTO conversations (contact_id, channel_id, assigned_to, status, unread_count)
SELECT 
  id,
  'whatsapp',
  'SEU_USER_ID_AQUI'::uuid,
  'open',
  0
FROM contacts
WHERE name = 'Você (Teste)'
ON CONFLICT (contact_id, channel_id) DO NOTHING;
