-- ============================================
-- Migration: Sistema de Notificações
-- Sprint 3 - US-027
-- ============================================

-- Criar tabela de notificações
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Conteúdo da notificação
  title VARCHAR(200) NOT NULL,
  message TEXT NOT NULL,
  type VARCHAR(50) NOT NULL CHECK (type IN (
    'automation_executed',
    'deal_updated',
    'task_assigned',
    'task_due',
    'activity_reminder',
    'mention',
    'system'
  )),
  
  -- Metadados
  entity_type VARCHAR(50), -- 'deal', 'contact', 'task', 'activity'
  entity_id UUID,
  link VARCHAR(500), -- URL para navegar ao clicar
  
  -- Status
  read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMP WITH TIME ZONE,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar índices para performance
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX idx_notifications_user_unread ON notifications(user_id, read) WHERE read = FALSE;

-- Habilitar RLS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Políticas de RLS
CREATE POLICY "Users can view their own notifications"
  ON notifications
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications"
  ON notifications
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "System can insert notifications"
  ON notifications
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can delete their own notifications"
  ON notifications
  FOR DELETE
  USING (auth.uid() = user_id);

-- Trigger para atualizar updated_at
CREATE TRIGGER update_notifications_updated_at
  BEFORE UPDATE ON notifications
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Função para criar notificação (helper)
CREATE OR REPLACE FUNCTION create_notification(
  p_user_id UUID,
  p_title VARCHAR(200),
  p_message TEXT,
  p_type VARCHAR(50),
  p_entity_type VARCHAR(50) DEFAULT NULL,
  p_entity_id UUID DEFAULT NULL,
  p_link VARCHAR(500) DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_notification_id UUID;
BEGIN
  INSERT INTO notifications (
    user_id,
    title,
    message,
    type,
    entity_type,
    entity_id,
    link
  ) VALUES (
    p_user_id,
    p_title,
    p_message,
    p_type,
    p_entity_type,
    p_entity_id,
    p_link
  )
  RETURNING id INTO v_notification_id;
  
  RETURN v_notification_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- View para notificações não lidas
CREATE OR REPLACE VIEW unread_notifications_count AS
SELECT 
  user_id,
  COUNT(*) as unread_count
FROM notifications
WHERE read = FALSE
GROUP BY user_id;

-- Comentários
COMMENT ON TABLE notifications IS 'Sistema de notificações em tempo real';
COMMENT ON COLUMN notifications.type IS 'Tipo de notificação: automation_executed, deal_updated, task_assigned, etc';
COMMENT ON COLUMN notifications.entity_type IS 'Tipo de entidade relacionada (opcional)';
COMMENT ON COLUMN notifications.entity_id IS 'ID da entidade relacionada (opcional)';
COMMENT ON COLUMN notifications.link IS 'URL para navegação ao clicar na notificação';
