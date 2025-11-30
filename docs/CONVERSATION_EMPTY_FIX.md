# 🔧 Diagnosticando Conversas em Branco

## 📋 Resumo do Problema

**Sintoma:** Página `/dashboard/conversations` carrega mas não mostra nenhuma conversa

**Possível Causa:** Uma das 3 situações:

1. ❓ Usuário não autenticado
2. ❓ Campo `assigned_to` vazio nas conversas
3. ❓ Usuário autenticado não tem conversas atribuídas

## 🚀 Diagnóstico Rápido (5 minutos)

### Passo 1: Executar Script SQL (2 min)

1. Abra: https://supabase.com/dashboard/project/[SEU-PROJETO]/sql
2. Cole o código de: `supabase/DEBUG_CONVERSATIONS.sql`
3. Clique em "Run"
4. **Anote os resultados**

**Procure por:**
- Total de conversas
- Quantas têm `assigned_to` preenchido
- Quantas têm `assigned_to = NULL`

### Passo 2: Testar API (2 min)

1. Abra: http://localhost:3000/dashboard/conversations
2. Abra Console (Ctrl + Shift + J)
3. Cole:

```javascript
fetch('/api/conversations')
  .then(r => r.json())
  .then(d => console.log(d))
```

**Esperado:**
- ✅ `[ { id, contact, ... } ]` - Funcionando!
- ❌ `[]` - Conversas não encontradas
- ❌ `{ error: 'Unauthorized' }` - Não autenticado

### Passo 3: Verificar Logs (1 min)

Terminal onde rodou `npm run dev` deve mostrar:

```
[DEBUG] User authenticated: user-id-123...
[DEBUG] All conversations (first 5): { count: 5, data: [...] }
[DEBUG] By assigned_to: { count: 0, error: null }
```

## 🛠️ Soluções por Causa

### Solução 1️⃣: assigned_to é NULL

**No Supabase SQL Editor:**

```sql
-- Pegar um user válido
SELECT id FROM auth.users LIMIT 1;
-- Copie o ID (ex: abc-123-def-456)

-- Atualizar conversas
UPDATE conversations 
SET assigned_to = 'abc-123-def-456'::uuid
WHERE assigned_to IS NULL;

-- Verificar
SELECT COUNT(*) FROM conversations WHERE assigned_to IS NOT NULL;
```

### Solução 2️⃣: Usuário não tem conversas atribuídas

**Opção A:** Atualizar conversas para o usuário logado

```sql
-- Seu user_id aparece em:
-- - Browser Console: localStorage.getItem('sb-auth-token')
-- - Supabase: SELECT id FROM auth.users WHERE email = 'seu@email.com'

UPDATE conversations 
SET assigned_to = '[SEU-USER-ID]'::uuid
LIMIT 10;
```

**Opção B:** Remover filtro temporariamente (rápido)

Edite: `src/app/api/conversations/route.ts`

Comentar a linha 56:
```typescript
// .eq('assigned_to', user.id)  // ← comentar isto
```

Salve e teste.

### Solução 3️⃣: Usuário não autenticado

1. Vá para http://localhost:3000/login
2. Login com seu email/senha
3. Acesse /dashboard/conversations

## 📊 Checklist de Diagnóstico

```
TESTE 1: Conversas existem no BD?
  [ ] Executou script SQL
  [ ] Viu COUNT(*) > 0
  
TESTE 2: assigned_to está preenchido?
  [ ] Viu "Conversas com assigned_to" > 0
  [ ] OU viu "Conversas com assigned_to = NULL" > 0
  
TESTE 3: API retorna dados?
  [ ] Executou fetch('/api/conversations')
  [ ] Viu resposta ([] ou [...])
  [ ] Verificou console logs
  
TESTE 4: Usuário autenticado?
  [ ] localStorage.getItem('sb-auth-token') existe
  [ ] Console não mostra "Unauthorized"
  [ ] Login funcionou
```

## 📝 Próximos Passos

1. ✅ Execute o diagnóstico acima
2. ✅ Identifique qual é o problema
3. ✅ Aplique a solução correspondente
4. ✅ Teste novamente
5. ✅ Me reporte qual foi o problema!

## 🆘 Se Nada Disso Funcionar

Colete estas informações:

```javascript
// No console do navegador
{
  "user_id": localStorage.getItem('sb-auth-token'),
  "conversas_no_bd": "número de SELECT COUNT(*)",
  "conversas_com_assigned_to": "número de WHERE assigned_to IS NOT NULL",
  "api_response": "colar resposta de fetch('/api/conversations')",
  "logs": "colar [DEBUG] logs de npm run dev"
}
```

---

**Tempo total:** ~10 minutos para identificar e corrigir! ⏱️
