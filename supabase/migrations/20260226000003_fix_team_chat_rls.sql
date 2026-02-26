-- =====================================================
-- Fix: infinite recursion nas RLS policies do chat
-- O problema: team_room_members_select fazia subquery
-- na própria tabela → recursão infinita.
-- Solução: policies simples sem auto-referência.
-- =====================================================

-- Remove todas as policies existentes (todas as tabelas do chat)
DROP POLICY IF EXISTS team_room_members_select ON team_room_members;
DROP POLICY IF EXISTS team_room_members_insert ON team_room_members;
DROP POLICY IF EXISTS team_room_members_update ON team_room_members;
DROP POLICY IF EXISTS team_rooms_select         ON team_rooms;
DROP POLICY IF EXISTS team_rooms_insert         ON team_rooms;
DROP POLICY IF EXISTS team_rooms_update         ON team_rooms;
DROP POLICY IF EXISTS team_messages_select      ON team_messages;
DROP POLICY IF EXISTS team_messages_insert      ON team_messages;

-- ── team_room_members ────────────────────────────────────────────────
-- SELECT: usuário vê apenas as suas próprias linhas de membership
--         (não há recursão — compara coluna com auth.uid() direto)
CREATE POLICY team_room_members_select ON team_room_members
  FOR SELECT USING (user_id = auth.uid());

-- INSERT: apenas o próprio usuário pode se inserir
--         ou quem criou a sala insere outro membro
CREATE POLICY team_room_members_insert ON team_room_members
  FOR INSERT WITH CHECK (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM team_rooms
      WHERE id = room_id AND created_by = auth.uid()
    )
  );

-- UPDATE: apenas o próprio membro (ex: last_read_at)
CREATE POLICY team_room_members_update ON team_room_members
  FOR UPDATE USING (user_id = auth.uid());

-- ── team_rooms ───────────────────────────────────────────────────────
-- SELECT: usa EXISTS contra team_room_members (agora sem recursão,
--         porque team_room_members usa user_id = auth.uid())
CREATE POLICY team_rooms_select ON team_rooms
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM team_room_members
      WHERE room_id = id AND user_id = auth.uid()
    )
  );

-- UPDATE: apenas o criador da sala
CREATE POLICY team_rooms_update ON team_rooms
  FOR UPDATE USING (created_by = auth.uid());

-- ── team_messages ────────────────────────────────────────────────────
-- SELECT: mensagens de salas onde o usuário é membro
CREATE POLICY team_messages_select ON team_messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM team_room_members
      WHERE room_id = team_messages.room_id AND user_id = auth.uid()
    )
  );

-- INSERT: remetente é o próprio usuário + deve ser membro da sala
CREATE POLICY team_messages_insert ON team_messages
  FOR INSERT WITH CHECK (
    sender_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM team_room_members
      WHERE room_id = team_messages.room_id AND user_id = auth.uid()
    )
  );
