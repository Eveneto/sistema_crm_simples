# 🔍 Debug - Conversas não aparecem no app

## Problema

Tabela `conversations` existe no Supabase com dados, mas nada aparece no app.

## Possíveis Causas

1. ❓ Usuário não está autenticado
2. ❓ Campo `assigned_to` está vazio nas conversas
3. ❓ Usuário autenticado não tem conversas atribuídas (`assigned_to`)
4. ❓ Erro na query do Supabase

## Como Debugar

### Passo 1: Verificar Autenticação

Abra o console do navegador (Ctrl + Shift + J) e execute:

```javascript
// Verificar se tem token de auth
console.log('Token:', localStorage.getItem('sb-auth-token'));

// Verificar cookies
console.log('Cookies:', document.cookie);
```

**Se não tiver token:** Login não funcionou, faça login primeiro.

### Passo 2: Testar API Diretamente

No console, execute:

```javascript
fetch('/api/conversations')
  .then(r => r.json())
  .then(data => console.log('Resposta:', data))
  .catch(e => console.error('Erro:', e));
```

**Esperado:**
- ✅ Array de conversas: `[{ id, contact, last_message_at, ... }]`
- ❌ `[]` (vazio): Veja próximos passos
- ❌ `{ error: 'Unauthorized' }`: Usuário não autenticado

### Passo 3: Verificar Dados no Supabase

Abra o SQL Editor do Supabase e execute:

```sql
-- Ver quantas conversas existem
SELECT COUNT(*) FROM conversations;

-- Ver conversas com assigned_to NULL
SELECT id, contact_id, assigned_to, status 
FROM conversations 
WHERE assigned_to IS NULL 
LIMIT 10;

-- Ver todas as conversas
SELECT id, contact_id, assigned_to, status 
FROM conversations 
LIMIT 10;

-- Ver usuários autenticados
SELECT id, email FROM auth.users;

-- Correlacionar: seu user ID com conversas
SELECT c.id, c.contact_id, c.assigned_to, u.email
FROM conversations c
LEFT JOIN auth.users u ON c.assigned_to = u.id
LIMIT 10;
```

### Passo 4: Verificar Logs da API

A API agora mostra logs em console. Verifique:

```
npm run dev

# Terminal deve mostrar:
[DEBUG] User authenticated: user-id-aqui
[DEBUG] All conversations (first 5): { count: X, data: [...] }
[DEBUG] By assigned_to: { count: X, error: null }
```

## Soluções Comuns

### ✅ Problema: `assigned_to` é NULL

**Solução:** Populare as conversas com usuário:

```sql
-- Obter um user_id válido
SELECT id FROM auth.users LIMIT 1;
-- Copie o ID do resultado (ex: abc123def456...)

-- Atualizar conversas com assigned_to
UPDATE conversations 
SET assigned_to = 'abc123def456...'::uuid
WHERE assigned_to IS NULL;

-- Verificar se funcionou
SELECT COUNT(*) FROM conversations WHERE assigned_to IS NOT NULL;
```

### ✅ Problema: Nenhuma conversa tem o user_id do usuário logado

**Solução 1:** Atualizar manualmente (veja acima)

**Solução 2:** Temporariamente remover filtro de `assigned_to`

Na API (`src/app/api/conversations/route.ts`), comentar:
```typescript
// .eq('assigned_to', user.id)  // ← comentar esta linha
```

### ✅ Problema: Usuário não está autenticado

**Solução:** 
1. Vá para http://localhost:3000/login
2. Faça login com email/senha
3. Depois acesse /dashboard/conversations

## Arquivos Modificados

**API:** `src/app/api/conversations/route.ts`
- ✅ Adicionado debug logging
- ✅ Fallback se `assigned_to` não retornar dados
- ✅ Melhor tratamento de erros

## Próximas Ações

1. ✅ Execute os comandos SQL acima
2. ✅ Verifique os logs em `npm run dev`
3. ✅ Teste a API no console
4. ✅ Reporte o resultado

## Exemplo de Resposta Esperada

Se tudo estiver OK, a API deve retornar:

```json
[
  {
    "id": "conv-123",
    "status": "open",
    "unread_count": 2,
    "last_message_at": "2025-11-30T10:30:00Z",
    "created_at": "2025-11-30T10:00:00Z",
    "updated_at": "2025-11-30T10:30:00Z",
    "contact": {
      "id": "contact-456",
      "name": "João Silva",
      "phone": "(11) 98765-4321",
      "email": "joao@example.com",
      "avatar_url": null
    }
  }
]
```

---

## Checklist de Debugging

- [ ] Verificou autenticação (token exists)
- [ ] Testou API com `fetch('/api/conversations')`
- [ ] Viu resultado (array ou vazio)
- [ ] Executou queries SQL no Supabase
- [ ] Verificou valores de `assigned_to`
- [ ] Confirmou que usuário logado tem conversas atribuídas
- [ ] Viu logs em `npm run dev`

---

**Status:** Aguardando seus resultados para próximas ações! 🔍
