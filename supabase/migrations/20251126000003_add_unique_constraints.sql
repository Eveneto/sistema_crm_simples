-- ============================================
-- Migration: Adicionar constraints únicas para deduplicação
-- ============================================

-- 1. Email único em contacts (não pode ter dois contatos com mesmo email)
ALTER TABLE contacts 
ADD CONSTRAINT contacts_email_key UNIQUE (email);

-- 2. Um contato pode ter apenas uma conversa ativa por canal
CREATE UNIQUE INDEX IF NOT EXISTS conversations_contact_channel_key 
ON conversations(contact_id, channel_id);

-- 3. Índice único em deals por contact_id + title (evita deals duplicados com mesmo nome para um contato)
-- Nota: Não usamos constraint UNIQUE porque pode haver deals históricos com mesmo título
-- Usaremos apenas para deduplicação no seed script
CREATE UNIQUE INDEX IF NOT EXISTS deals_contact_title_key 
ON deals(contact_id, title) 
WHERE status != 'lost'; -- Permite recriar deals perdidos

COMMENT ON CONSTRAINT contacts_email_key ON contacts IS 
'Email deve ser único para cada contato';

COMMENT ON INDEX conversations_contact_channel_key IS 
'Um contato pode ter apenas uma conversa por canal';

COMMENT ON INDEX deals_contact_title_key IS 
'Evita deals duplicados com mesmo título para um contato (exceto perdidos)';
