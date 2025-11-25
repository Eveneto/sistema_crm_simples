-- =====================================================
-- CRM Simplificado - Row Level Security (RLS)
-- Sprint 1: Políticas de Segurança
-- =====================================================

-- =====================================================
-- HABILITAR RLS EM TODAS AS TABELAS
-- =====================================================

ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE deal_stages ENABLE ROW LEVEL SECURITY;
ALTER TABLE deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- POLICIES: user_profiles
-- =====================================================

-- Usuários podem ver seu próprio perfil
CREATE POLICY "users_view_own_profile"
  ON user_profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Usuários podem atualizar seu próprio perfil
CREATE POLICY "users_update_own_profile"
  ON user_profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Usuários podem ver perfis de outros usuários (para atribuição)
CREATE POLICY "users_view_other_profiles"
  ON user_profiles FOR SELECT
  TO authenticated
  USING (true);

-- Admins podem inserir novos perfis
CREATE POLICY "admins_insert_profiles"
  ON user_profiles FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role = 'admin'
    )
  );

-- =====================================================
-- POLICIES: contacts
-- =====================================================

-- Todos os usuários autenticados podem ver contatos
CREATE POLICY "authenticated_view_contacts"
  ON contacts FOR SELECT
  TO authenticated
  USING (true);

-- Todos os usuários autenticados podem criar contatos
CREATE POLICY "authenticated_insert_contacts"
  ON contacts FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Todos os usuários autenticados podem atualizar contatos
CREATE POLICY "authenticated_update_contacts"
  ON contacts FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Apenas admins e managers podem deletar contatos
CREATE POLICY "managers_delete_contacts"
  ON contacts FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role IN ('admin', 'manager')
    )
  );

-- =====================================================
-- POLICIES: channels
-- =====================================================

-- Todos podem ver canais
CREATE POLICY "authenticated_view_channels"
  ON channels FOR SELECT
  TO authenticated
  USING (true);

-- Apenas admins podem gerenciar canais
CREATE POLICY "admins_manage_channels"
  ON channels FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role = 'admin'
    )
  );

-- =====================================================
-- POLICIES: conversations
-- =====================================================

-- Usuários podem ver conversas
CREATE POLICY "authenticated_view_conversations"
  ON conversations FOR SELECT
  TO authenticated
  USING (true);

-- Usuários podem criar conversas
CREATE POLICY "authenticated_insert_conversations"
  ON conversations FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Usuários podem atualizar conversas
CREATE POLICY "authenticated_update_conversations"
  ON conversations FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- =====================================================
-- POLICIES: messages
-- =====================================================

-- Usuários podem ver mensagens
CREATE POLICY "authenticated_view_messages"
  ON messages FOR SELECT
  TO authenticated
  USING (true);

-- Usuários podem inserir mensagens
CREATE POLICY "authenticated_insert_messages"
  ON messages FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Usuários podem atualizar mensagens (marcar como lida)
CREATE POLICY "authenticated_update_messages"
  ON messages FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- =====================================================
-- POLICIES: deal_stages
-- =====================================================

-- Todos podem ver os estágios
CREATE POLICY "authenticated_view_stages"
  ON deal_stages FOR SELECT
  TO authenticated
  USING (true);

-- Apenas admins e managers podem gerenciar estágios
CREATE POLICY "managers_manage_stages"
  ON deal_stages FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role IN ('admin', 'manager')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role IN ('admin', 'manager')
    )
  );

-- =====================================================
-- POLICIES: deals
-- =====================================================

-- Usuários podem ver negócios
CREATE POLICY "authenticated_view_deals"
  ON deals FOR SELECT
  TO authenticated
  USING (true);

-- Usuários podem criar negócios
CREATE POLICY "authenticated_insert_deals"
  ON deals FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Usuários podem atualizar negócios
CREATE POLICY "authenticated_update_deals"
  ON deals FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Apenas admins e managers podem deletar negócios
CREATE POLICY "managers_delete_deals"
  ON deals FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role IN ('admin', 'manager')
    )
  );

-- =====================================================
-- POLICIES: activities
-- =====================================================

-- Usuários podem ver todas as atividades
CREATE POLICY "authenticated_view_activities"
  ON activities FOR SELECT
  TO authenticated
  USING (true);

-- Usuários podem criar atividades
CREATE POLICY "authenticated_insert_activities"
  ON activities FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Usuários podem atualizar atividades atribuídas a eles
CREATE POLICY "users_update_own_activities"
  ON activities FOR UPDATE
  TO authenticated
  USING (assigned_to = auth.uid())
  WITH CHECK (assigned_to = auth.uid());

-- Managers podem atualizar qualquer atividade
CREATE POLICY "managers_update_any_activities"
  ON activities FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role IN ('admin', 'manager')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role IN ('admin', 'manager')
    )
  );

-- Apenas o criador ou managers podem deletar atividades
CREATE POLICY "users_delete_own_activities"
  ON activities FOR DELETE
  TO authenticated
  USING (
    assigned_to = auth.uid() OR
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role IN ('admin', 'manager')
    )
  );

-- =====================================================
-- FUNCTION: Criar perfil automaticamente após registro
-- =====================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, full_name, avatar_url, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'Usuário'),
    NEW.raw_user_meta_data->>'avatar_url',
    COALESCE(NEW.raw_user_meta_data->>'role', 'agent')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para criar perfil automaticamente
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- =====================================================
-- FUNCTION: Atualizar last_message_at na conversa
-- =====================================================

CREATE OR REPLACE FUNCTION update_conversation_last_message()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE conversations
  SET 
    last_message_at = NEW.created_at,
    unread_count = CASE 
      WHEN NEW.sender_type = 'contact' THEN unread_count + 1 
      ELSE unread_count 
    END
  WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS on_message_created ON messages;
CREATE TRIGGER on_message_created
  AFTER INSERT ON messages
  FOR EACH ROW
  EXECUTE FUNCTION update_conversation_last_message();

-- =====================================================
-- FIM DO SCRIPT
-- =====================================================

-- Para verificar as políticas criadas:
-- SELECT * FROM pg_policies WHERE schemaname = 'public';
