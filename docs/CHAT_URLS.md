# 🔗 URLs do Chat MVP

## URLs de Acesso

### Chat Page
- **URL:** `http://localhost:3000/dashboard/conversations`
- **Arquivo:** `/src/app/(dashboard)/dashboard/conversations/page.tsx`
- **Status:** ✅ Ativa

### Aliases
- **Conversa (antiga):** `/dashboard/conversas` → não use mais
- **Correta (nova):** `/dashboard/conversations` → use esta!

---

## APIs de Chat

### GET /api/conversations
- **Descrição:** Lista todas as conversas do usuário
- **Method:** GET
- **Response:** Array de conversas com detalhes de contato

### POST /api/messages
- **Descrição:** Envia nova mensagem
- **Method:** POST
- **Body:** `{ conversation_id: string, content: string }`
- **Response:** Mensagem criada

### GET /api/conversations/[id]
- **Descrição:** Obtém conversa específica com histórico
- **Method:** GET
- **Response:** Conversa + últimas 50 mensagens

### PATCH /api/conversations/[id]/read
- **Descrição:** Marca conversa como lida
- **Method:** PATCH
- **Response:** Conversa atualizada

---

## Para Testar

```bash
# 1. Rodar dev server
npm run dev

# 2. Abrir browser em:
http://localhost:3000/dashboard/conversations

# 3. Pronto! Chat funcionando 🎉
```

---

**Atualizado:** 30/11/2025
