-- ============================================
-- Migration: Sistema de Tarefas e Lembretes
-- Sprint 3 - US-028
-- ============================================

-- Criar tabela de tarefas
CREATE TABLE IF NOT EXISTS tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Informações básicas
  title VARCHAR(200) NOT NULL,
  description TEXT,
  
  -- Relacionamentos opcionais
  deal_id UUID REFERENCES deals(id) ON DELETE CASCADE,
  contact_id UUID REFERENCES contacts(id) ON DELETE CASCADE,
  
  -- Status e prioridade
  status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (status IN (
    'pending',
    'in_progress',
    'completed',
    'cancelled'
  )),
  priority VARCHAR(50) NOT NULL DEFAULT 'medium' CHECK (priority IN (
    'low',
    'medium',
    'high',
    'urgent'
  )),
  
  -- Datas
  due_date TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  
  -- Atribuição
  assigned_to UUID REFERENCES auth.users(id),
  
  -- Lembrete
  reminder_sent BOOLEAN DEFAULT FALSE,
  reminder_at TIMESTAMP WITH TIME ZONE,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar índices para performance
CREATE INDEX idx_tasks_user_id ON tasks(user_id);
CREATE INDEX idx_tasks_assigned_to ON tasks(assigned_to);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_priority ON tasks(priority);
CREATE INDEX idx_tasks_due_date ON tasks(due_date);
CREATE INDEX idx_tasks_deal_id ON tasks(deal_id);
CREATE INDEX idx_tasks_contact_id ON tasks(contact_id);
CREATE INDEX idx_tasks_reminder_pending ON tasks(reminder_at, reminder_sent) 
  WHERE reminder_sent = FALSE AND reminder_at IS NOT NULL;

-- Habilitar RLS
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- Políticas de RLS
CREATE POLICY "Users can view their own tasks"
  ON tasks
  FOR SELECT
  USING (auth.uid() = user_id OR auth.uid() = assigned_to);

CREATE POLICY "Users can create tasks"
  ON tasks
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own tasks"
  ON tasks
  FOR UPDATE
  USING (auth.uid() = user_id OR auth.uid() = assigned_to);

CREATE POLICY "Users can delete their own tasks"
  ON tasks
  FOR DELETE
  USING (auth.uid() = user_id);

-- Trigger para atualizar updated_at
CREATE TRIGGER update_tasks_updated_at
  BEFORE UPDATE ON tasks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger para setar completed_at quando status muda para completed
CREATE OR REPLACE FUNCTION set_task_completed_at()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
    NEW.completed_at = NOW();
  ELSIF NEW.status != 'completed' THEN
    NEW.completed_at = NULL;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER task_completed_trigger
  BEFORE UPDATE ON tasks
  FOR EACH ROW
  EXECUTE FUNCTION set_task_completed_at();

-- View para tarefas pendentes
CREATE OR REPLACE VIEW pending_tasks AS
SELECT 
  t.*,
  u.email as assigned_to_email,
  d.title as deal_title,
  c.name as contact_name
FROM tasks t
LEFT JOIN auth.users u ON t.assigned_to = u.id
LEFT JOIN deals d ON t.deal_id = d.id
LEFT JOIN contacts c ON t.contact_id = c.id
WHERE t.status IN ('pending', 'in_progress')
ORDER BY 
  CASE t.priority
    WHEN 'urgent' THEN 1
    WHEN 'high' THEN 2
    WHEN 'medium' THEN 3
    WHEN 'low' THEN 4
  END,
  t.due_date NULLS LAST;

-- View para tarefas vencidas
CREATE OR REPLACE VIEW overdue_tasks AS
SELECT 
  t.*,
  u.email as assigned_to_email,
  d.title as deal_title,
  c.name as contact_name
FROM tasks t
LEFT JOIN auth.users u ON t.assigned_to = u.id
LEFT JOIN deals d ON t.deal_id = d.id
LEFT JOIN contacts c ON t.contact_id = c.id
WHERE t.status IN ('pending', 'in_progress')
  AND t.due_date < NOW()
ORDER BY t.due_date DESC;

-- Comentários
COMMENT ON TABLE tasks IS 'Sistema de tarefas e lembretes';
COMMENT ON COLUMN tasks.status IS 'Status: pending, in_progress, completed, cancelled';
COMMENT ON COLUMN tasks.priority IS 'Prioridade: low, medium, high, urgent';
COMMENT ON COLUMN tasks.due_date IS 'Data de vencimento da tarefa';
COMMENT ON COLUMN tasks.reminder_at IS 'Data/hora para enviar lembrete';
COMMENT ON COLUMN tasks.reminder_sent IS 'Flag indicando se o lembrete já foi enviado';
