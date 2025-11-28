# 🔧 Instruções para Aplicar Migrations no Supabase

## ⚠️ Problema Atual

Erro: `Could not find the table 'public.notifications' in the schema cache`

**Causa:** As tabelas `notifications` e `tasks` ainda não foram criadas no banco de dados Supabase.

---

## ✅ Solução: Executar Migrations via Supabase Dashboard

### Passo 1: Acessar SQL Editor

1. Acesse: https://supabase.com/dashboard
2. Selecione seu projeto
3. No menu lateral, clique em **SQL Editor**
4. Clique em **New query**

### Passo 2: Executar Migration de Notificações

Cole o SQL abaixo e clique em **Run** (ou Ctrl+Enter):

```sql
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
  entity_type VARCHAR(50),
  entity_id UUID,
  link VARCHAR(500),

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
  ON notifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications"
  ON notifications FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "System can insert notifications"
  ON notifications FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can delete their own notifications"
  ON notifications FOR DELETE
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
    user_id, title, message, type,
    entity_type, entity_id, link
  ) VALUES (
    p_user_id, p_title, p_message, p_type,
    p_entity_type, p_entity_id, p_link
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
```

### Passo 3: Executar Migration de Tasks (Opcional - para US-028)

Crie uma **nova query** e execute:

```sql
-- ============================================
-- Migration: Sistema de Tarefas
-- Sprint 3 - US-028
-- ============================================

CREATE TABLE IF NOT EXISTS tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  title VARCHAR(200) NOT NULL,
  description TEXT,

  deal_id UUID REFERENCES deals(id) ON DELETE CASCADE,
  contact_id UUID REFERENCES contacts(id) ON DELETE CASCADE,

  status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (status IN (
    'pending', 'in_progress', 'completed', 'cancelled'
  )),
  priority VARCHAR(50) NOT NULL DEFAULT 'medium' CHECK (priority IN (
    'low', 'medium', 'high', 'urgent'
  )),

  due_date TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  assigned_to UUID REFERENCES auth.users(id),

  reminder_sent BOOLEAN DEFAULT FALSE,
  reminder_at TIMESTAMP WITH TIME ZONE,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_tasks_user_id ON tasks(user_id);
CREATE INDEX idx_tasks_assigned_to ON tasks(assigned_to);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_priority ON tasks(priority);
CREATE INDEX idx_tasks_due_date ON tasks(due_date);
CREATE INDEX idx_tasks_deal_id ON tasks(deal_id);
CREATE INDEX idx_tasks_contact_id ON tasks(contact_id);

-- RLS
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own tasks"
  ON tasks FOR SELECT
  USING (auth.uid() = user_id OR auth.uid() = assigned_to);

CREATE POLICY "Users can create tasks"
  ON tasks FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own tasks"
  ON tasks FOR UPDATE
  USING (auth.uid() = user_id OR auth.uid() = assigned_to);

CREATE POLICY "Users can delete their own tasks"
  ON tasks FOR DELETE
  USING (auth.uid() = user_id);

-- Triggers
CREATE TRIGGER update_tasks_updated_at
  BEFORE UPDATE ON tasks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

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
```

### Passo 4: Verificar Tabelas Criadas

No Supabase Dashboard, vá em **Table Editor** e confirme que as tabelas `notifications` e `tasks` aparecem na lista.

### Passo 5: Recarregar Aplicação

Após executar as migrations:

1. Pare o servidor Next.js (Ctrl+C)
2. Reinicie: `npm run dev`
3. Recarregue a página no navegador

O erro deve desaparecer! ✅

---

## 🔄 Opção Alternativa: Supabase CLI (Local)

Se preferir usar CLI:

```bash
# Instalar Supabase CLI (se ainda não tiver)
npm install -g supabase

# Login
supabase login

# Link ao projeto
supabase link --project-ref SEU_PROJECT_REF

# Aplicar migrations
supabase db push
```

---

## 📝 Verificação de Sucesso

Após executar as migrations, você deve ver:

✅ No console do Next.js: Notificações carregando sem erros  
✅ No header: Ícone de sino (🔔) aparecendo  
✅ No Supabase: Tabelas `notifications` e `tasks` listadas

---

## ❓ Troubleshooting

**Erro: "function update_updated_at_column does not exist"**
→ Execute primeiro a migration que cria essa função (deve estar em uma migration anterior)

**Erro: "relation already exists"**
→ Normal se executar duas vezes. Use `DROP TABLE IF EXISTS notifications CASCADE;` antes de recriar

**Ainda mostra erro PGRST205**
→ Reinicie o servidor Next.js e limpe o cache do navegador (Ctrl+Shift+R)

---

**Criado:** 2025-11-28  
**Sprint 3:** US-027 e US-028
