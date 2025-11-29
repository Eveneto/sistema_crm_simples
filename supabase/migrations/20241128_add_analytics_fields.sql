-- =====================================================
-- Migration: Adicionar campos para Analytics
-- Data: 2024-11-28
-- Descrição: Adiciona campos necessários para o módulo de Analytics Avançado
-- =====================================================

-- 1. Adicionar coluna probability (probabilidade de fechamento)
-- Usado para calcular receita esperada e forecast
ALTER TABLE deals
ADD COLUMN IF NOT EXISTS probability INTEGER DEFAULT 50 CHECK (probability >= 0 AND probability <= 100);

-- 2. Adicionar coluna user_id (dono do deal)
-- Diferente de assigned_to (responsável), user_id é quem criou/possui o deal
ALTER TABLE deals
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- 3. Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_deals_probability ON deals(probability);
CREATE INDEX IF NOT EXISTS idx_deals_user_id ON deals(user_id);

-- 4. Copiar valores de assigned_to para user_id (migração de dados)
UPDATE deals 
SET user_id = assigned_to
WHERE user_id IS NULL AND assigned_to IS NOT NULL;

-- 5. Copiar valores de created_by se user_id ainda estiver NULL
-- (fallback para deals antigos)
UPDATE deals 
SET user_id = (SELECT created_by FROM contacts WHERE contacts.id = deals.contact_id)
WHERE user_id IS NULL;

-- 6. Adicionar coluna stage (enum/text) para facilitar queries
-- Mantém compatibilidade com stage_id mas adiciona campo direto
ALTER TABLE deals
ADD COLUMN IF NOT EXISTS stage TEXT;

-- 7. Popular campo stage baseado em stage_id
UPDATE deals 
SET stage = (
  CASE 
    WHEN (SELECT name FROM deal_stages WHERE id = deals.stage_id) = 'Sem Contato' THEN 'lead'
    WHEN (SELECT name FROM deal_stages WHERE id = deals.stage_id) = 'Prospecção' THEN 'qualified'
    WHEN (SELECT name FROM deal_stages WHERE id = deals.stage_id) = 'Prospecção 2' THEN 'qualified'
    WHEN (SELECT name FROM deal_stages WHERE id = deals.stage_id) = 'Conexão' THEN 'proposal'
    WHEN (SELECT name FROM deal_stages WHERE id = deals.stage_id) = 'Fechado/Ganho' THEN 'won'
    WHEN (SELECT name FROM deal_stages WHERE id = deals.stage_id) = 'Perdido' THEN 'lost'
    ELSE 'lead'
  END
)
WHERE stage IS NULL;

-- 8. Criar índice para stage
CREATE INDEX IF NOT EXISTS idx_deals_stage_text ON deals(stage);

-- 9. Trigger para manter stage sincronizado com stage_id
CREATE OR REPLACE FUNCTION sync_deal_stage()
RETURNS TRIGGER AS $$
BEGIN
  -- Quando stage_id muda, atualiza stage
  IF NEW.stage_id IS DISTINCT FROM OLD.stage_id THEN
    NEW.stage := (
      SELECT CASE 
        WHEN name ILIKE '%sem contato%' OR name ILIKE '%lead%' THEN 'lead'
        WHEN name ILIKE '%qualif%' OR name ILIKE '%prospec%' THEN 'qualified'
        WHEN name ILIKE '%proposta%' OR name ILIKE '%proposal%' THEN 'proposal'
        WHEN name ILIKE '%negoci%' OR name ILIKE '%conex%' THEN 'negotiation'
        WHEN name ILIKE '%ganho%' OR name ILIKE '%fechado%' OR name ILIKE '%won%' THEN 'won'
        WHEN name ILIKE '%perdido%' OR name ILIKE '%lost%' THEN 'lost'
        ELSE 'lead'
      END
      FROM deal_stages 
      WHERE id = NEW.stage_id
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_sync_deal_stage
  BEFORE UPDATE ON deals
  FOR EACH ROW
  EXECUTE FUNCTION sync_deal_stage();

-- 10. Comentários nas colunas
COMMENT ON COLUMN deals.probability IS 'Probabilidade de fechamento do deal (0-100%). Usado para cálculo de receita esperada';
COMMENT ON COLUMN deals.user_id IS 'Dono/criador do deal. Diferente de assigned_to (responsável atual)';
COMMENT ON COLUMN deals.stage IS 'Estágio do deal em formato texto para queries rápidas. Valores: lead, qualified, proposal, negotiation, won, lost';

-- =====================================================
-- Nota: Campos opcionais para funcionalidades futuras
-- =====================================================

-- OPCIONAL: Adicionar campo source (origem do lead)
-- Descomente se quiser implementar "Origem de Leads"
-- ALTER TABLE contacts
-- ADD COLUMN IF NOT EXISTS source TEXT;
-- CREATE INDEX IF NOT EXISTS idx_contacts_source ON contacts(source);
-- COMMENT ON COLUMN contacts.source IS 'Origem do lead: website, social-media, referral, email-campaign, etc';

-- OPCIONAL: Criar tabela de metas
-- Descomente se quiser implementar "Progresso de Metas"
-- CREATE TABLE IF NOT EXISTS goals (
--   id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
--   user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
--   name TEXT NOT NULL,
--   target_value DECIMAL(10, 2) NOT NULL,
--   period TEXT NOT NULL CHECK (period IN ('monthly', 'quarterly', 'yearly')),
--   start_date DATE NOT NULL,
--   end_date DATE NOT NULL,
--   created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
-- );
-- CREATE INDEX idx_goals_user_id ON goals(user_id);
-- CREATE INDEX idx_goals_period ON goals(period, start_date, end_date);
-- COMMENT ON TABLE goals IS 'Metas de vendas por usuário';

-- =====================================================
-- FIM DA MIGRATION
-- =====================================================
