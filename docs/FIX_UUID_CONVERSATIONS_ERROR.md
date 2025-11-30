# 🐛 FIX: UUID Error em Conversas API

## ❌ Problema Encontrado

```
Error creating conversation {
  error: {
    code: '22P02',
    message: 'invalid input syntax for type uuid: "whatsapp"'
  }
}
```

### Causa

A coluna `channel_id` na tabela `conversations` é do tipo **UUID**, não string.

```sql
-- Definição da tabela
CREATE TABLE conversations (
  id UUID PRIMARY KEY,
  contact_id UUID NOT NULL,
  channel_id UUID NOT NULL REFERENCES channels(id),  ← UUID!
  assigned_to UUID,
  ...
)
```

Mas a API estava tentando inserir:
```typescript
{
  channel_id: 'whatsapp'  ← String! ❌
}
```

## ✅ Solução Implementada

### 1. Mudança na API

**Arquivo:** `src/app/api/conversations/create/route.ts`

```typescript
// ANTES ❌
const { contact_id, channel_id = 'whatsapp' } = body;

// DEPOIS ✅
const { contact_id, channel_type = 'whatsapp' } = body;

// API agora busca o UUID do canal
const { data: channel } = await supabase
  .from('channels')
  .select('id')
  .eq('type', channel_type)
  .single();

// Usa o UUID correto
insert({ channel_id: channel.id })
```

### 2. Mudança no Component

**Arquivo:** `src/components/chat/create-conversation-dialog.tsx`

```typescript
// ANTES ❌
body: JSON.stringify({
  contact_id: selectedContactId,
  channel_id: 'whatsapp',  // String
})

// DEPOIS ✅
body: JSON.stringify({
  contact_id: selectedContactId,
  channel_type: 'whatsapp',  // Tipo, não UUID
})
```

### 3. Script SQL para Canal

**Arquivo:** `supabase/CREATE_WHATSAPP_CHANNEL.sql`

Se o canal WhatsApp não existir, execute este script:

```sql
INSERT INTO channels (id, type, name, phone, is_connected, config)
VALUES (
  '00000000-0000-0000-0000-000000000001'::uuid,
  'whatsapp',
  'WhatsApp',
  NULL,
  FALSE,
  '{}'::jsonb
)
ON CONFLICT (id) DO NOTHING;
```

## 🚀 Como Usar

### Passo 1: Criar Canal WhatsApp (uma vez)

1. Abra Supabase Dashboard
2. Vá em **SQL Editor**
3. Cole o conteúdo de `supabase/CREATE_WHATSAPP_CHANNEL.sql`
4. Clique em **Run**
5. ✅ Canal criado!

### Passo 2: Testar a Feature

1. Acesse `/dashboard/conversations`
2. Clique "Nova Conversa"
3. Selecione um contato
4. Clique "Criar Conversa"
5. ✅ Deve funcionar agora!

## 📊 Fluxo Correto

```
User
  │
  └─ Clica "Nova Conversa"
      │
      └─ Seleciona contato (UUID)
      │
      └─ API recebe:
         {
           contact_id: "uuid-do-contato",
           channel_type: "whatsapp"  ← String!
         }
      │
      └─ API procura channel com type='whatsapp'
         → Obtém: { id: "uuid-do-canal" }  ← UUID!
      │
      └─ API insere na tabela:
         {
           contact_id: "uuid-do-contato",
           channel_id: "uuid-do-canal",  ← UUID correto!
           assigned_to: "uuid-do-user",
           status: "open"
         }
      │
      └─ ✅ Conversa criada com sucesso!
```

## 🔍 Verificar se Funcionou

### No Console do Navegador (F12)
```javascript
// Teste criar uma conversa
fetch('/api/conversations/create', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    contact_id: 'uuid-de-um-contato',
    channel_type: 'whatsapp'
  })
})
.then(r => r.json())
.then(d => console.log(d))
```

### No SQL do Supabase
```sql
-- Verificar se conversas foram criadas
SELECT 
  id,
  contact_id,
  channel_id,
  assigned_to,
  status,
  created_at
FROM conversations
ORDER BY created_at DESC
LIMIT 10;
```

## 🧪 Testes

### Teste 1: Criar Conversa
```
✅ Pré-requisito: Canal WhatsApp existe
✅ Pré-requisito: Contatos existem
✅ Pré-requisito: Você está autenticado

1. Vá para /dashboard/conversations
2. Clique "Nova Conversa"
3. Selecione um contato
4. Clique "Criar Conversa"
5. ✅ Toast: "Conversa criada com sucesso!"
6. ✅ Conversa aparece na sidebar
```

### Teste 2: Evitar Duplicata
```
✅ Após criar primeira conversa

1. Clique "Nova Conversa" novamente
2. Selecione o MESMO contato
3. Clique "Criar Conversa"
4. ✅ Retorna conversa existente
5. ✅ Sem duplicar
```

### Teste 3: Enviar Mensagem
```
✅ Após conversa criada

1. Digite uma mensagem
2. Pressione Enter
3. ✅ Mensagem aparece
4. ✅ Status: "✓ Enviado"
```

## 📝 Notas Técnicas

### Por que mudamos?

A arquitetura correta é:

```
channels table (catalogo)
├─ id (UUID) ← PK
├─ type (text) ← 'whatsapp', 'telegram', etc
├─ name (text) ← 'WhatsApp', 'Telegram', etc
└─ ...

conversations table (dados)
├─ id (UUID) ← PK
├─ channel_id (UUID) ← FK para channels.id
├─ contact_id (UUID) ← FK para contacts.id
└─ ...
```

Então:
- **Input:** `channel_type` (string: 'whatsapp', 'telegram')
- **Process:** Lookup na tabela channels
- **Database:** `channel_id` (UUID)

### Segurança

- ✅ Validação: Se canal não existe, retorna erro
- ✅ Constraint: FK garante channel_id válido
- ✅ Integridade: Não permite channel_id inválido

## ✅ Checklist

- [x] Corrigido erro UUID
- [x] API agora busca channel correto
- [x] Component envia channel_type
- [x] Build passa
- [x] Script SQL criado
- [x] Documentação escrita
- [x] Teste pronto

## 🚀 Status

```
✅ Bug fixado
✅ Code updated
✅ Build: PASSED
✅ Ready for testing
```

## 📞 Se Tiver Problemas

### Erro: "Canal 'whatsapp' não encontrado"

**Solução:** Execute `CREATE_WHATSAPP_CHANNEL.sql` no Supabase SQL Editor

### Erro: "Contato não encontrado"

**Solução:** Certifique-se que o contato existe em `/dashboard/contacts`

### Erro: "Não autenticado"

**Solução:** Faça login novamente

---

**Feature agora está corrigida e pronta para uso!** ✅
