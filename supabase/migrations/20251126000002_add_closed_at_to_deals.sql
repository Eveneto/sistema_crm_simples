-- Adicionar coluna closed_at na tabela deals
-- Esta coluna é necessária para rastrear quando um deal foi ganho ou perdido

ALTER TABLE deals 
ADD COLUMN IF NOT EXISTS closed_at TIMESTAMP WITH TIME ZONE;

-- Criar índice para performance em queries filtradas por closed_at
CREATE INDEX IF NOT EXISTS idx_deals_closed_at ON deals(closed_at) WHERE closed_at IS NOT NULL;

-- Atualizar deals existentes que já foram ganhos/perdidos
-- Usa updated_at como valor padrão para closed_at
UPDATE deals 
SET closed_at = updated_at
WHERE status IN ('won', 'lost') 
  AND closed_at IS NULL;

-- Comentário da coluna
COMMENT ON COLUMN deals.closed_at IS 'Data e hora em que o deal foi marcado como ganho ou perdido';
