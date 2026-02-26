-- =====================================================
-- Fix: user_profiles visível para toda a equipe
-- Por padrão, RLS só permite ver o próprio perfil.
-- Para o chat interno funcionar, usuários autenticados
-- precisam ver os perfis dos colegas.
-- =====================================================

-- Verifica se RLS está ativo em user_profiles
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Remove policy restritiva anterior (se existir)
DROP POLICY IF EXISTS user_profiles_select       ON user_profiles;
DROP POLICY IF EXISTS profiles_select_own        ON user_profiles;
DROP POLICY IF EXISTS select_own_profile         ON user_profiles;

-- Qualquer usuário autenticado pode LER perfis da equipe
CREATE POLICY user_profiles_select_authenticated ON user_profiles
  FOR SELECT
  TO authenticated
  USING (true);

-- Cada usuário só pode ALTERAR o próprio perfil
DROP POLICY IF EXISTS user_profiles_update             ON user_profiles;
DROP POLICY IF EXISTS user_profiles_update_own         ON user_profiles;
DROP POLICY IF EXISTS update_own_profile               ON user_profiles;

CREATE POLICY user_profiles_update_own ON user_profiles
  FOR UPDATE
  TO authenticated
  USING (id = auth.uid());

-- Apenas o próprio usuário pode INSERIR seu perfil
DROP POLICY IF EXISTS user_profiles_insert             ON user_profiles;
DROP POLICY IF EXISTS user_profiles_insert_own         ON user_profiles;
DROP POLICY IF EXISTS insert_own_profile               ON user_profiles;

CREATE POLICY user_profiles_insert_own ON user_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (id = auth.uid());
