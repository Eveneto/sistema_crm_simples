-- =====================================================
-- Sprint A — Meta WhatsApp Cloud API
-- Adiciona campos da Meta API na tabela channels
-- =====================================================

-- Adicionar campos Meta WhatsApp na tabela channels
ALTER TABLE channels
  ADD COLUMN IF NOT EXISTS meta_phone_number_id    TEXT,
  ADD COLUMN IF NOT EXISTS meta_waba_id            TEXT,
  ADD COLUMN IF NOT EXISTS meta_access_token       TEXT,
  ADD COLUMN IF NOT EXISTS meta_app_secret         TEXT,
  ADD COLUMN IF NOT EXISTS meta_verify_token       TEXT,
  ADD COLUMN IF NOT EXISTS meta_business_name      TEXT,
  ADD COLUMN IF NOT EXISTS meta_display_phone      TEXT;  -- ex: "+55 11 91234-5678"

-- Tornar evolution_instance_id opcional (já é nullable, só documentar)
COMMENT ON COLUMN channels.evolution_instance_id IS
  'ID da instância Evolution API. Nulo quando o canal usa Meta Cloud API.';

-- Comentários dos novos campos
COMMENT ON COLUMN channels.meta_phone_number_id IS
  'Phone Number ID do Meta Business Manager (ex: 123456789012345)';

COMMENT ON COLUMN channels.meta_waba_id IS
  'WhatsApp Business Account ID (WABA ID) da Meta';

COMMENT ON COLUMN channels.meta_access_token IS
  'Access Token de sistema da Meta (System User Token ou permanent token). Nunca expor no frontend.';

COMMENT ON COLUMN channels.meta_app_secret IS
  'App Secret do App Meta for Developers. Usado para validar assinatura HMAC-SHA256 dos webhooks.';

COMMENT ON COLUMN channels.meta_verify_token IS
  'Token de verificação definido pelo desenvolvedor. Enviado pela Meta ao registrar o webhook.';

COMMENT ON COLUMN channels.meta_business_name IS
  'Nome do negócio cadastrado no WhatsApp Business Manager.';

COMMENT ON COLUMN channels.meta_display_phone IS
  'Número de telefone formatado para exibição na interface.';

-- Atualizar constraint de tipo para incluir canais futuros
-- (o tipo 'whatsapp' já cobre os dois provedores; provider é determinado pelos campos preenchidos)

-- View auxiliar: identifica o provider pelo preenchimento dos campos
CREATE OR REPLACE VIEW channels_with_provider AS
SELECT
  *,
  CASE
    WHEN meta_phone_number_id IS NOT NULL THEN 'meta'
    WHEN evolution_instance_id IS NOT NULL THEN 'evolution'
    ELSE 'unconfigured'
  END AS provider
FROM channels;

COMMENT ON VIEW channels_with_provider IS
  'View que determina o provider de cada canal pelo preenchimento dos campos correspondentes.';

-- Índice para lookup por phone_number_id (usado no processamento de webhooks Meta)
CREATE INDEX IF NOT EXISTS idx_channels_meta_phone_number_id
  ON channels(meta_phone_number_id)
  WHERE meta_phone_number_id IS NOT NULL;

-- Índice para lookup por waba_id
CREATE INDEX IF NOT EXISTS idx_channels_meta_waba_id
  ON channels(meta_waba_id)
  WHERE meta_waba_id IS NOT NULL;
