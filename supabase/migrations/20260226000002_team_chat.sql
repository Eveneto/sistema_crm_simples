-- =====================================================
-- Chat Interno de Equipe
-- Migration: 20260226000002_team_chat
-- =====================================================

-- =====================================================
-- TABELA: team_rooms
-- Sala de conversa (DM ou grupo no futuro)
-- type = 'direct' → DM entre 2 users
-- type = 'group'  → grupo com N users (futuro)
-- =====================================================
CREATE TABLE IF NOT EXISTS team_rooms (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type          TEXT NOT NULL DEFAULT 'direct' CHECK (type IN ('direct', 'group')),
  name          TEXT,                                    -- NULL para DMs, obrigatório para grupos
  created_by    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at    TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at    TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_team_rooms_created_by ON team_rooms(created_by);
CREATE INDEX idx_team_rooms_type       ON team_rooms(type);

CREATE TRIGGER update_team_rooms_updated_at
  BEFORE UPDATE ON team_rooms
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- TABELA: team_room_members
-- Quem participa de cada sala
-- last_read_at → usado para calcular badge não lido
-- =====================================================
CREATE TABLE IF NOT EXISTS team_room_members (
  room_id      UUID NOT NULL REFERENCES team_rooms(id) ON DELETE CASCADE,
  user_id      UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  joined_at    TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_read_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (room_id, user_id)
);

CREATE INDEX idx_team_room_members_user ON team_room_members(user_id);
CREATE INDEX idx_team_room_members_room ON team_room_members(room_id);

-- =====================================================
-- TABELA: team_messages
-- Mensagens do chat interno
-- =====================================================
CREATE TABLE IF NOT EXISTS team_messages (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  room_id      UUID NOT NULL REFERENCES team_rooms(id) ON DELETE CASCADE,
  sender_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content      TEXT NOT NULL CHECK (char_length(content) BETWEEN 1 AND 10000),
  message_type TEXT NOT NULL DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'file')),
  created_at   TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_team_messages_room        ON team_messages(room_id);
CREATE INDEX idx_team_messages_room_ts     ON team_messages(room_id, created_at DESC);
CREATE INDEX idx_team_messages_sender      ON team_messages(sender_id);

-- =====================================================
-- FUNÇÃO: get_or_create_direct_room
-- Retorna sala DM existente entre dois usuários
-- ou cria uma nova — evita salas duplicadas
-- =====================================================
CREATE OR REPLACE FUNCTION get_or_create_direct_room(user_a UUID, user_b UUID)
RETURNS UUID
LANGUAGE plpgsql SECURITY DEFINER
AS $$
DECLARE
  v_room_id UUID;
BEGIN
  -- Busca sala DM que contenha exatamente os dois usuários
  SELECT m1.room_id INTO v_room_id
  FROM team_room_members m1
  JOIN team_room_members m2 ON m1.room_id = m2.room_id
  JOIN team_rooms r         ON r.id = m1.room_id
  WHERE m1.user_id = user_a
    AND m2.user_id = user_b
    AND r.type = 'direct'
  LIMIT 1;

  IF v_room_id IS NOT NULL THEN
    RETURN v_room_id;
  END IF;

  -- Cria nova sala DM
  INSERT INTO team_rooms (type, created_by)
  VALUES ('direct', user_a)
  RETURNING id INTO v_room_id;

  INSERT INTO team_room_members (room_id, user_id)
  VALUES (v_room_id, user_a), (v_room_id, user_b);

  RETURN v_room_id;
END;
$$;

-- =====================================================
-- VIEW: team_rooms_with_details
-- Sala + último mensagem + contagem não lido
-- Facilita a listagem no frontend
-- =====================================================
CREATE OR REPLACE VIEW team_rooms_with_details AS
SELECT
  r.id,
  r.type,
  r.name,
  r.created_at,
  r.updated_at,
  -- Último conteúdo e timestamp
  lm.content           AS last_message_content,
  lm.created_at        AS last_message_at,
  lm.sender_id         AS last_message_sender_id,
  -- Membro que está consultando (resolvido no app com user_id)
  m.user_id            AS viewer_id,
  m.last_read_at,
  -- Contagem de mensagens não lidas
  (
    SELECT COUNT(*)
    FROM team_messages tm
    WHERE tm.room_id = r.id
      AND tm.created_at > m.last_read_at
      AND tm.sender_id != m.user_id
  )::INT AS unread_count
FROM team_rooms r
JOIN team_room_members m ON m.room_id = r.id
LEFT JOIN LATERAL (
  SELECT content, created_at, sender_id
  FROM team_messages
  WHERE room_id = r.id
  ORDER BY created_at DESC
  LIMIT 1
) lm ON TRUE;

-- =====================================================
-- RLS — Row Level Security
-- =====================================================
ALTER TABLE team_rooms         ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_room_members  ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_messages      ENABLE ROW LEVEL SECURITY;

-- team_rooms: ver apenas salas onde é membro
CREATE POLICY team_rooms_select ON team_rooms
  FOR SELECT USING (
    id IN (
      SELECT room_id FROM team_room_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY team_rooms_insert ON team_rooms
  FOR INSERT WITH CHECK (created_by = auth.uid());

CREATE POLICY team_rooms_update ON team_rooms
  FOR UPDATE USING (created_by = auth.uid());

-- team_room_members: ver apenas suas próprias salas
CREATE POLICY team_room_members_select ON team_room_members
  FOR SELECT USING (
    room_id IN (
      SELECT room_id FROM team_room_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY team_room_members_insert ON team_room_members
  FOR INSERT WITH CHECK (
    room_id IN (
      SELECT room_id FROM team_room_members WHERE user_id = auth.uid()
    )
    OR user_id = auth.uid()
  );

CREATE POLICY team_room_members_update ON team_room_members
  FOR UPDATE USING (user_id = auth.uid());

-- team_messages: ver e escrever apenas em salas onde é membro
CREATE POLICY team_messages_select ON team_messages
  FOR SELECT USING (
    room_id IN (
      SELECT room_id FROM team_room_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY team_messages_insert ON team_messages
  FOR INSERT WITH CHECK (
    sender_id = auth.uid()
    AND room_id IN (
      SELECT room_id FROM team_room_members WHERE user_id = auth.uid()
    )
  );

-- =====================================================
-- COMENTÁRIOS
-- =====================================================
COMMENT ON TABLE team_rooms        IS 'Salas do chat interno (DM ou grupo)';
COMMENT ON TABLE team_room_members IS 'Membros de cada sala — last_read_at para badge';
COMMENT ON TABLE team_messages     IS 'Mensagens do chat interno';
COMMENT ON FUNCTION get_or_create_direct_room IS 'Retorna ou cria sala DM entre dois usuários sem duplicar';
