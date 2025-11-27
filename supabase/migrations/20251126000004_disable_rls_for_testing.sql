-- ============================================
-- ATENÇÃO: Políticas RLS ABERTAS para TESTE
-- ============================================
-- Em produção, você deve ter políticas mais restritivas

-- Permitir leitura pública em contacts
DROP POLICY IF EXISTS "Enable read access for all users" ON contacts;
CREATE POLICY "Enable read access for all users" ON contacts
  FOR SELECT USING (true);

-- Permitir leitura pública em conversations
DROP POLICY IF EXISTS "Enable read access for all users" ON conversations;
CREATE POLICY "Enable read access for all users" ON conversations
  FOR SELECT USING (true);

-- Permitir leitura pública em deals
DROP POLICY IF EXISTS "Enable read access for all users" ON deals;
CREATE POLICY "Enable read access for all users" ON deals
  FOR SELECT USING (true);

-- Permitir leitura pública em deal_stages
DROP POLICY IF EXISTS "Enable read access for all users" ON deal_stages;
CREATE POLICY "Enable read access for all users" ON deal_stages
  FOR SELECT USING (true);

-- Permitir leitura pública em channels
DROP POLICY IF EXISTS "Enable read access for all users" ON channels;
CREATE POLICY "Enable read access for all users" ON channels
  FOR SELECT USING (true);

-- Permitir leitura pública em messages
DROP POLICY IF EXISTS "Enable read access for all users" ON messages;
CREATE POLICY "Enable read access for all users" ON messages
  FOR SELECT USING (true);

COMMENT ON POLICY "Enable read access for all users" ON contacts IS 
'Política aberta para teste - permitir leitura sem autenticação';

COMMENT ON POLICY "Enable read access for all users" ON deals IS 
'Política aberta para teste - permitir leitura sem autenticação';
