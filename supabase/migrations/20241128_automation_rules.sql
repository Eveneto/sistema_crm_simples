-- ============================================
-- Migration: Automation Rules
-- Created: 2024-11-28
-- Description: Sistema de automações para CRM
-- Sprint: 3 - US-026
-- ============================================

-- Tabela de regras de automação
CREATE TABLE automation_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  
  -- Condições (trigger)
  trigger_type VARCHAR(50) NOT NULL, -- 'time_based', 'status_change', 'tag_added', 'value_threshold', 'stage_entered'
  trigger_conditions JSONB NOT NULL, -- { "days_inactive": 7, "stage": "proposta" }
  
  -- Ações a serem executadas
  actions JSONB NOT NULL, -- [{ "type": "move_stage", "target_stage": "negociacao" }]
  
  -- Metadados
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_executed_at TIMESTAMP WITH TIME ZONE
);

-- Comentários
COMMENT ON TABLE automation_rules IS 'Regras de automação do funil de vendas';
COMMENT ON COLUMN automation_rules.trigger_type IS 'Tipo de gatilho: time_based, status_change, tag_added, value_threshold, stage_entered';
COMMENT ON COLUMN automation_rules.trigger_conditions IS 'Condições para disparar a automação (JSON)';
COMMENT ON COLUMN automation_rules.actions IS 'Ações a serem executadas (Array JSON)';

-- Índices para performance
CREATE INDEX idx_automation_rules_user_id ON automation_rules(user_id);
CREATE INDEX idx_automation_rules_is_active ON automation_rules(is_active);
CREATE INDEX idx_automation_rules_trigger_type ON automation_rules(trigger_type);
CREATE INDEX idx_automation_rules_created_at ON automation_rules(created_at DESC);

-- ============================================
-- Row Level Security (RLS)
-- ============================================

ALTER TABLE automation_rules ENABLE ROW LEVEL SECURITY;

-- Policy: Usuários podem ver suas próprias regras
CREATE POLICY "Users can view own automation rules"
  ON automation_rules FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Usuários podem criar suas próprias regras
CREATE POLICY "Users can create own automation rules"
  ON automation_rules FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Usuários podem atualizar suas próprias regras
CREATE POLICY "Users can update own automation rules"
  ON automation_rules FOR UPDATE
  USING (auth.uid() = user_id);

-- Policy: Usuários podem deletar suas próprias regras
CREATE POLICY "Users can delete own automation rules"
  ON automation_rules FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- Tabela de logs de execução de automações
-- ============================================

CREATE TABLE automation_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  automation_rule_id UUID NOT NULL REFERENCES automation_rules(id) ON DELETE CASCADE,
  deal_id UUID REFERENCES deals(id) ON DELETE CASCADE,
  contact_id UUID REFERENCES contacts(id) ON DELETE CASCADE,
  
  executed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status VARCHAR(20) NOT NULL, -- 'success', 'error', 'skipped'
  actions_performed JSONB, -- [{ "type": "move_stage", "from": "proposta", "to": "negociacao", "success": true }]
  error_message TEXT,
  
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Comentários
COMMENT ON TABLE automation_logs IS 'Logs de execução das automações para auditoria';
COMMENT ON COLUMN automation_logs.status IS 'Status da execução: success, error, skipped';
COMMENT ON COLUMN automation_logs.actions_performed IS 'Ações que foram executadas (Array JSON)';

-- Índices para consultas de logs
CREATE INDEX idx_automation_logs_rule_id ON automation_logs(automation_rule_id);
CREATE INDEX idx_automation_logs_deal_id ON automation_logs(deal_id);
CREATE INDEX idx_automation_logs_contact_id ON automation_logs(contact_id);
CREATE INDEX idx_automation_logs_executed_at ON automation_logs(executed_at DESC);
CREATE INDEX idx_automation_logs_status ON automation_logs(status);

-- RLS para logs
ALTER TABLE automation_logs ENABLE ROW LEVEL SECURITY;

-- Policy: Usuários podem ver logs de suas próprias automações
CREATE POLICY "Users can view own automation logs"
  ON automation_logs FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Sistema pode inserir logs (sem RLS no INSERT para cron jobs)
CREATE POLICY "System can create automation logs"
  ON automation_logs FOR INSERT
  WITH CHECK (true);

-- ============================================
-- Função para atualizar updated_at automaticamente
-- ============================================

CREATE OR REPLACE FUNCTION update_automation_rules_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER automation_rules_updated_at
  BEFORE UPDATE ON automation_rules
  FOR EACH ROW
  EXECUTE FUNCTION update_automation_rules_updated_at();

-- ============================================
-- Dados de seed para desenvolvimento/testes
-- ============================================

-- Inserir regras de exemplo (comentado, descomentar para usar)
/*
INSERT INTO automation_rules (user_id, name, description, is_active, trigger_type, trigger_conditions, actions)
VALUES
  (
    auth.uid(),
    'Mover negócio após 7 dias parado',
    'Move automaticamente negócios que ficam 7 dias sem atividade na etapa de Proposta',
    true,
    'time_based',
    '{"days_inactive": 7, "stage": "proposta"}',
    '[
      {"type": "move_stage", "target_stage": "negociacao"},
      {"type": "create_task", "task_title": "Follow-up necessário", "task_description": "Negócio estava parado há 7 dias"}
    ]'
  ),
  (
    auth.uid(),
    'Alertar negócio de alto valor',
    'Envia notificação e adiciona tag para negócios acima de R$ 50.000',
    true,
    'value_threshold',
    '{"min_value": 50000}',
    '[
      {"type": "send_notification", "notification_message": "🔥 Novo negócio de alto valor criado!"},
      {"type": "add_tag", "tag": "alto-valor"},
      {"type": "change_priority", "priority": "high"}
    ]'
  );
*/

-- ============================================
-- Verificação de integridade
-- ============================================

-- Constraint: trigger_type deve ser válido
ALTER TABLE automation_rules 
  ADD CONSTRAINT check_trigger_type 
  CHECK (trigger_type IN ('time_based', 'status_change', 'tag_added', 'value_threshold', 'stage_entered'));

-- Constraint: status do log deve ser válido
ALTER TABLE automation_logs
  ADD CONSTRAINT check_log_status
  CHECK (status IN ('success', 'error', 'skipped'));

-- Constraint: ações não podem estar vazias
ALTER TABLE automation_rules
  ADD CONSTRAINT check_actions_not_empty
  CHECK (jsonb_array_length(actions) > 0);

-- ============================================
-- Views úteis para consultas
-- ============================================

-- View: Regras ativas com contagem de execuções
CREATE OR REPLACE VIEW v_automation_rules_stats AS
SELECT 
  ar.id,
  ar.user_id,
  ar.name,
  ar.description,
  ar.is_active,
  ar.trigger_type,
  ar.created_at,
  ar.last_executed_at,
  COUNT(al.id) as total_executions,
  COUNT(al.id) FILTER (WHERE al.status = 'success') as successful_executions,
  COUNT(al.id) FILTER (WHERE al.status = 'error') as failed_executions
FROM automation_rules ar
LEFT JOIN automation_logs al ON ar.id = al.automation_rule_id
GROUP BY ar.id;

-- Grant acesso à view
GRANT SELECT ON v_automation_rules_stats TO authenticated;

-- ============================================
-- Fim da migration
-- ============================================

-- Verificação final
DO $$
BEGIN
  RAISE NOTICE '✅ Migration automation_rules aplicada com sucesso!';
  RAISE NOTICE '📊 Tabelas criadas: automation_rules, automation_logs';
  RAISE NOTICE '🔒 RLS habilitado em ambas as tabelas';
  RAISE NOTICE '📈 View criada: v_automation_rules_stats';
END $$;
