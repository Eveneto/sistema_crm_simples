# 🚀 QUICK START: Teste a Feature de Conversas

## ⚡ Em 5 Minutos

### 1. Verificar Banco (1 min)

Na Supabase, execute no SQL Editor:

```sql
-- Verificar se WhatsApp channel existe
SELECT id, type, name FROM channels WHERE type = 'whatsapp';

-- Se não existir, execute:
INSERT INTO channels (id, type, name, is_connected, config)
VALUES (
  '00000000-0000-0000-0000-000000000001'::uuid,
  'whatsapp',
  'WhatsApp',
  FALSE,
  '{}'::jsonb
)
ON CONFLICT (id) DO NOTHING;

-- Verificar conversas
SELECT id, contact_id, assigned_to FROM conversations LIMIT 5;
```

### 2. Verificar Conversas Atribuídas (1 min)

Se conversas têm `assigned_to = NULL`, execute:

```sql
-- Ver seu user_id
SELECT id, email FROM auth.users LIMIT 1;

-- Atribuir conversas a você
UPDATE conversations
SET assigned_to = 'SEU_USER_ID'::uuid
WHERE assigned_to IS NULL;
```

### 3. Iniciar Server (1 min)

```bash
cd /home/dev_pc/Documentos/crm_simplificado
npm run dev
```

Aguarde até ver:
```
✓ Ready in 1.2s
```

### 4. Abrir Aplicativo (1 min)

```
http://localhost:3000/dashboard/conversations
```

### 5. Testar Feature (1 min)

```
1. Clique "Nova Conversa"
2. Selecione um contato
3. Clique "Criar Conversa"
4. ✅ Toast: "Conversa criada com sucesso"
5. Digite uma mensagem
6. Pressione Enter
7. ✅ Mensagem aparece!
```

---

## 🎯 Resultado Esperado

```
Conversa será criada:
├─ contact_id: UUID do contato
├─ assigned_to: SEU_USER_ID
├─ channel_id: UUID do WhatsApp
└─ status: 'open'

Você conseguirá:
✅ Ver conversa na sidebar
✅ Clicar e abrir chat
✅ Enviar mensagens
✅ Ver mensagens antigas
✅ Marcar como lida
```

---

## ⚠️ Se Algo Não Funcionar

### Erro: "Conversa não encontrada"
```bash
# Verifique conversas no banco:
Supabase → SQL Editor →
SELECT COUNT(*) FROM conversations;
```

### Erro: "Validação falhou"
```bash
# Abra DevTools (F12) → Console
# Procure por: [DEBUG] Validation error
# Veja qual campo falhou
```

### Erro: "Mensagem não enviada"
```bash
# Verifique se conversa tem assigned_to:
Supabase → SQL Editor →
SELECT assigned_to FROM conversations LIMIT 1;

# Se NULL, execute fix acima
```

### Server não inicia
```bash
# Verifique porta 3000
lsof -i :3000

# Se ocupada, mude porta:
npm run dev -- -p 3001
```

---

## 📚 Documentação Completa

Se quiser entender mais:

- `docs/FEATURE_CONVERSATIONS_STATUS.md` - Status completo
- `docs/FIX_UUID_CONVERSATIONS_ERROR.md` - Erro de UUID
- `docs/FIX_CONVERSATIONS_NOT_SHOWING.md` - Conversas não aparecem
- `docs/FIX_SEND_MESSAGES_VALIDATION.md` - Erro ao enviar

---

## ✅ Checklist Final

- [ ] Banco: WhatsApp channel criado
- [ ] Banco: Conversas têm assigned_to
- [ ] Server: Rodando em http://localhost:3000
- [ ] UI: Carrega conversas
- [ ] UI: Consegue criar conversa
- [ ] UI: Consegue enviar mensagem
- [ ] Console: Sem erros vermelhos

---

**Pronto! Feature está funcional!** 🎉
