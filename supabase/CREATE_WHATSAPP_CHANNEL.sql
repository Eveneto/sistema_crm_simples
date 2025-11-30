-- ============================================
-- SCRIPT: Criar Canal WhatsApp (se não existir)
-- ============================================
-- Execute este script no SQL Editor do Supabase

-- Criar canal WhatsApp padrão (se não existir)
INSERT INTO channels (id, type, name, phone, is_connected, config, created_at, updated_at)
VALUES 
  (
    '00000000-0000-0000-0000-000000000001'::uuid,
    'whatsapp',
    'WhatsApp',
    NULL,
    FALSE,
    '{}'::jsonb,
    NOW(),
    NOW()
  )
ON CONFLICT (id) DO NOTHING;

-- Verificar se canal foi criado
SELECT 
  id,
  type,
  name,
  is_connected,
  created_at
FROM channels
WHERE type = 'whatsapp'
LIMIT 1;
