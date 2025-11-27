-- ============================================
-- Permitir DELETE em contacts para todos usuários autenticados
-- ATENÇÃO: Em produção, restrinja isso apenas para admin/manager
-- ============================================

-- Remover política restritiva de DELETE
DROP POLICY IF EXISTS "managers_delete_contacts" ON contacts;

-- Criar nova política que permite DELETE para todos autenticados
CREATE POLICY "authenticated_delete_contacts"
  ON contacts FOR DELETE
  TO authenticated
  USING (true);

COMMENT ON POLICY "authenticated_delete_contacts" ON contacts IS 
'Política aberta para desenvolvimento - permite DELETE para todos usuários autenticados. 
Em produção, substituir por política que restringe a admin/manager apenas.';
