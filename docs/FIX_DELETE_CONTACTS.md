# 🔧 FIX: Permitir Exclusão de Contatos

## Problema
Os contatos não estão sendo excluídos porque a política de RLS (Row Level Security) do Supabase só permite DELETE para usuários com role `admin` ou `manager`.

## Solução
Execute o SQL abaixo no painel do Supabase para permitir DELETE para todos os usuários autenticados.

---

## 📝 Script SQL

```sql
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
```

---

## 🚀 Como Executar

### Opção 1: Painel do Supabase (Recomendado)

1. Acesse: https://supabase.com/dashboard/project/ypyghhpaqxgdrbsozplj
2. Vá em **SQL Editor**
3. Cole o script acima
4. Clique em **Run**
5. Aguarde confirmação de sucesso

### Opção 2: Supabase CLI (Se tiver instalado)

```bash
cd /home/dev_pc/Documentos/crm_simplificado
supabase db push
```

---

## ✅ Validação

Após executar o script, teste:

1. Acesse: http://localhost:3000/dashboard/contacts
2. Clique no ícone de olho em qualquer contato
3. Clique no botão "Excluir"
4. Confirme a exclusão
5. Verifique se:
   - Toast "Contato excluído!" aparece
   - Você é redirecionado para lista
   - Contato desaparece da lista

---

## ⚠️ Observação de Segurança

**Esta política está ABERTA para desenvolvimento.**

Em produção, você deve usar:

```sql
-- Apenas admins e managers podem deletar
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
```

---

## 📊 Impacto

| Antes | Depois |
|-------|--------|
| ❌ DELETE bloqueado por RLS | ✅ DELETE permitido |
| ❌ Apenas admin/manager | ✅ Todos autenticados |
| ❌ Contato não é excluído | ✅ Contato excluído com sucesso |

---

**Arquivo da migration:** `supabase/migrations/20251127000001_allow_delete_contacts.sql`

**Status:** Aguardando execução no Supabase
