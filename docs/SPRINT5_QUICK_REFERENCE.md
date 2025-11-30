# 🚀 SPRINT 5 - CARTÃO DE REFERÊNCIA RÁPIDA

**Leia isto em 2 minutos ⏱️**

---

## 🎯 OBJETIVO

**Implementar Chat funcional.**  
Nada mais, nada menos.

---

## 📅 TIMELINE

```
Seg 01/12 → Qua 03/12: Implementar core (15 pts)
Qui 04/12 → Sex 05/12: Polimento (3 pts)
Seg 08/12 → Sex 12/12: Buffer + Sprint 6 prep
```

---

## 📋 CHECKLIST (FAZER AGORA)

```bash
git checkout -b sprint-5/chat
mkdir -p src/app/\(dashboard\)/dashboard/conversas/{[id]}
mkdir -p src/components/chat

# Criar 2 arquivos:
# 1. src/types/message.ts
# 2. src/lib/validations/message.ts

git add .
git commit -m "chore: setup Sprint 5"
```

**Tempo:** 30 min

---

## 🎯 4 USER STORIES

| US | Nome | Dia | Pts |
|----|------|-----|-----|
| 059 | Listar conversas | Seg | 5 |
| 060 | Visualizar chat | Ter | 5 |
| 061 | Enviar mensagem | Qua | 5 |
| 062 | Badge não lido | Qui | 3 |

**Total:** 18 pts em ~9 horas

---

## 📁 ARQUIVOS (10 Total)

**Dia 1:**
- `conversas/page.tsx`
- `conversation-list.tsx`
- `conversation-item.tsx`

**Dia 2:**
- `conversas/[id]/page.tsx`
- `chat-window.tsx`
- `message-list.tsx`
- `message-item.tsx`

**Dia 3:**
- `api/messages/route.ts`
- `message-input.tsx`

**Dia 4:**
- `api/conversations/[id]/read/route.ts`

---

## 🏗️ ARQUITETURA

```
Pages:           /dashboard/conversas
                 /dashboard/conversas/[id]

Components:      ConversationList
                 ConversationItem
                 ChatWindow
                 MessageList
                 MessageItem
                 MessageInput

API:             POST /api/messages
                 PATCH /api/conversations/[id]/read

Types:           Conversation
                 Message

Validations:     createMessageSchema
```

---

## ✅ DEFINIÇÃO DE PRONTO

- [ ] Funciona (sem erros)
- [ ] Type-safe (TypeScript OK)
- [ ] Validado (Zod OK)
- [ ] Testado (80%+)
- [ ] Documentado (comments)
- [ ] Commitado (git push)
- [ ] Code review feito

---

## ⚠️ ARMADILHAS

❌ Esquecer RLS → Verificar `getUser()`  
❌ Sem validação → Usar Zod sempre  
❌ Realtime → NÃO fazer  
❌ Sem testes → Fazer tests simples  
❌ Types `any` → Usar tipos específicos  

---

## 🟢 PADRÕES SPRINT 4

```typescript
// Auth
const { user } = await supabaseServer.auth.getUser();

// API
const validated = schema.parse(data);
return NextResponse.json(result, { status: 200 });

// Form
const form = useForm({ resolver: zodResolver(schema) });

// Toast
const { toast } = useToast();
toast({ title: "Sucesso" });
```

---

## 📊 SUCESSO = ?

```
✅ Ver conversas
✅ Abrir chat
✅ Enviar msg
✅ Ver badge não lido

✅ Sem erros TS
✅ Testes rodando
✅ Deploy pronto

❌ Sem Realtime
❌ Sem notificações
❌ Sem media
```

---

## 🧪 TESTES (SIMPLES)

```
conversation-list.test.tsx → render, link
chat-window.test.tsx       → load msgs
message-input.test.tsx     → submit
api/messages               → POST validation
```

---

## 💾 COMMITS

```
Day 1: feat: implement US-059 (list conversations)
Day 2: feat: implement US-060 (view chat)
Day 3: feat: implement US-061 (send message)
Day 4: feat: implement US-062 (unread badge)
Day 5: test: add chat tests + code review
```

---

## 🚫 NÃO FAZER

- Realtime WebSocket
- Notificações push
- File uploads
- Voice/Video
- Integration WhatsApp
- Encryption
- Chatbot

---

## 🔄 DEPOIS (Sprint 6+)

```
Sprint 6: Contatos + Dashboard
Sprint 7: Atividades + Tasks
Sprint 8: WhatsApp integração
Sprint 9: Automações
```

---

## 📚 DOCUMENTOS

1. **SPRINT5_KICKOFF_CHAT_FOCUS.md** ← Leia primeiro
2. **SPRINT5_ACTION_PLAN.md** ← Consulte diariamente
3. **SPRINT5_PRESTART_CHECKLIST.md** ← Antes de começar
4. **SPRINT5_CONSOLIDATED_SUMMARY.md** ← Referência completa

---

## ⏱️ ESTIMATIVAS

- Setup: 0.5h
- US-059: 1.5h
- US-060: 2h
- US-061: 1.5h
- US-062: 0.5h
- Tests: 1.5h
- Refactor: 1h
- **TOTAL: 9h**

Buffer: 30h para ajustes

---

## 🎯 SEMANA 1

```
Seg: Setup + US-059 (listar)
Ter: US-060 (ver chat)
Qua: US-061 (enviar msg)
Qui: US-062 (badge) + testes
Sex: Polimento + code review
```

---

## 🎯 SEMANA 2

```
Seg-Ter: Melhorias UX (optional)
Qua: Finalizar Sprint 4
Qui: Testes cobertura
Sex: Deploy staging + sprint 6 prep
```

---

## 🚀 COMEÇAR

**Agora mesmo:**

```bash
git checkout -b sprint-5/chat
# ... setup do checklist ...
npm run dev
```

**Pronto!**

---

## 💡 MANTRA

> Keep It Simple, Stupid (KISS)
> 
> Chat funcional.
> Sem complexidade desnecessária.
> Pronto para produção em 9 horas.

---

**Status:** ✅ READY  
**Prioridade:** 🔴 CHAT  
**Lema:** 🎯 KISS  

**LET'S GO! 🚀**

---

*Referência rápida - imprima ou guarde aberto*
