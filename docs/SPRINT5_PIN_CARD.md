# 📌 SPRINT 5 - CARTÃO PIN (COLE NA PAREDE)

```
╔════════════════════════════════════════════════════════════════════╗
║                    🚀 SPRINT 5 - CHAT FIRST                       ║
║                                                                    ║
║  DATA:       01/12 - 14/12/2025 (2 semanas)                      ║
║  OBJETIVO:   Chat funcional end-to-end                           ║
║  LEMA:       KISS (Keep It Simple, Stupid)                       ║
║                                                                    ║
║  STORY POINTS: 18 (4 user stories)                               ║
║  TEMPO:        9 horas (estimado realista)                       ║
║  STATUS:       ✅ PRONTO PARA COMEÇAR                            ║
╚════════════════════════════════════════════════════════════════════╝
```

---

## ⚡ QUICK START (30 MIN)

```bash
# 1. Branch
git checkout -b sprint-5/chat

# 2. Pastas
mkdir -p src/app/\(dashboard\)/dashboard/conversas/{[id]}
mkdir -p src/components/chat

# 3. Tipos (criar arquivo)
# src/types/message.ts
export interface Conversation { ... }
export interface Message { ... }

# 4. Validação (criar arquivo)
# src/lib/validations/message.ts
export const createMessageSchema = z.object({ ... })

# 5. Commit
git add .
git commit -m "chore: setup Sprint 5"

# 6. Go!
npm run dev
```

---

## 📋 4 USER STORIES (18 pts)

```
┌─ US-059: Listar Conversas (5 pts, Seg)
│  ✅ Ver lista de conversas
│  ✅ Contact name + last msg + time
│  ✅ Click → abrir conversa
│
├─ US-060: Visualizar Chat (5 pts, Ter)
│  ✅ Ver histórico de msgs
│  ✅ Left/right bubbles
│  ✅ Scroll automático
│
├─ US-061: Enviar Mensagem (5 pts, Qua)
│  ✅ Input + botão enviar
│  ✅ Valida com Zod
│  ✅ Atualiza DB
│  ✅ Otimistic update
│
└─ US-062: Badge Não Lido (3 pts, Qui)
   ✅ Badge count em conversas
   ✅ Mark as read ao abrir
   ✅ Badge some quando lido
```

---

## 📁 ARQUIVOS A CRIAR (10)

```
Dia 1 (Seg):
  ✓ src/components/chat/conversation-list.tsx
  ✓ src/components/chat/conversation-item.tsx
  ✓ src/app/(dashboard)/dashboard/conversas/page.tsx

Dia 2 (Ter):
  ✓ src/components/chat/chat-window.tsx
  ✓ src/components/chat/message-list.tsx
  ✓ src/components/chat/message-item.tsx
  ✓ src/app/(dashboard)/dashboard/conversas/[id]/page.tsx

Dia 3 (Qua):
  ✓ src/app/api/messages/route.ts
  ✓ src/components/chat/message-input.tsx

Dia 4 (Qui):
  ✓ src/app/api/conversations/[id]/read/route.ts
```

---

## 🎯 TIMELINE VISUA

```
SEMANA 1: CORE CHAT
├─ Seg 01: Listar conversas       (1.5h) → 15 pts done
├─ Ter 02: Visualizar chat        (2.0h) → 15 pts done
├─ Qua 03: Enviar mensagem        (1.5h) → 15 pts done
├─ Qui 04: Badge não lido         (0.5h) → 18 pts done ✅
└─ Sex 05: Testes + polimento     (1.5h)

SEMANA 2: FINALIZAÇÃO
├─ Seg 08-Ter 09: Melhorias UX (optional)
├─ Qua 10: Sprint 4 cleanup
├─ Qui 11: Deploy staging
└─ Sex 12: Sprint review + prep Sprint 6
```

---

## 🟢 FAÇA

```
✅ Usar Zod para validação
✅ Reutilizar padrões Sprint 4
✅ Testes simples (80% coverage)
✅ TypeScript sempre
✅ Comments no código
✅ Commits frequentes
✅ Code review próprio
✅ RLS no database
```

---

## 🔴 NÃO FAÇA

```
❌ Realtime WebSocket
❌ Notificações push
❌ File uploads
❌ Voice/Video
❌ WhatsApp integration
❌ Encryption
❌ Chatbot
❌ 100% coverage (overkill)
```

---

## 🏗️ ARQUITETURA

```
Page: /conversas
  └─ ConversationList
     └─ ConversationItem → Click
        └─ Page: /conversas/[id]
           └─ ChatWindow
              ├─ MessageList
              │  └─ MessageItem[]
              └─ MessageInput
                 └─ POST /api/messages
                    └─ PATCH /api/conversations/[id]/read
```

---

## 📊 MÉTRICAS DE SUCESSO

| Métrica | Meta | ✅ |
|---------|------|-----|
| Chat funciona | 100% | 🎯 |
| 0 erros TS | Sim | 🎯 |
| Testes | 80%+ | 🎯 |
| Build OK | Sim | 🎯 |
| Deploy staging | Sim | 🎯 |
| Code reviewed | Sim | 🎯 |
| Documentado | Sim | 🎯 |

---

## 📚 DOCUMENTOS (Leia nesta ordem)

```
1️⃣  SPRINT5_QUICK_REFERENCE.md         (2 min)
2️⃣  SPRINT5_KICKOFF_CHAT_FOCUS.md      (15 min)
3️⃣  SPRINT5_ACTION_PLAN.md             (daily)
4️⃣  SPRINT5_PRESTART_CHECKLIST.md      (setup)
5️⃣  SPRINT5_CONSOLIDATED_SUMMARY.md    (reference)
```

---

## ⏱️ ESTIMATIVAS (REALISTAS)

```
Setup:          0.5h
US-059:         1.5h
US-060:         2.0h
US-061:         1.5h
US-062:         0.5h
Testes:         1.5h
Polimento:      1.0h
─────────────────────
TOTAL:          9h
BUFFER:        30h
CHANCE SUCESSO: 95%+
```

---

## 🎁 ENTREGÁVEIS DE HOJE

```
✅ 8 documentos
✅ 80+ páginas
✅ 3100+ linhas
✅ 8+ código examples
✅ 3 checklists
✅ 20+ tabelas/diagramas
✅ 100% pragmatismo (KISS)
✅ Máxima documentação

RESULTADO: Você não vai ficar preso!
```

---

## 🚀 COMEÇAR AGORA

```
┌─────────────────────┐
│ 1. Leia este card   │  (1 min)
└──────────┬──────────┘
           ↓
┌─────────────────────┐
│ 2. Abre referência  │  (2 min)
│    QUICK_REF.md     │
└──────────┬──────────┘
           ↓
┌─────────────────────┐
│ 3. Faz setup        │  (30 min)
│    Cria branch      │
│    Cria pastas      │
│    Cria tipos       │
└──────────┬──────────┘
           ↓
┌─────────────────────┐
│ 4. Pronto!          │
│    npm run dev      │
│    Começa code! 🚀  │
└─────────────────────┘
```

---

## 💡 PRO TIPS

```
1. Reutiliza Sprint 4 patterns
2. Commita frequentemente  
3. Testa enquanto codifica
4. Documenta enquanto vai
5. Usa Zod sempre
6. Mantém simples
7. Deixa realtime pra depois
```

---

## ✅ CHECKLIST (FAZ AGORA)

- [ ] Leu este card
- [ ] Abriu QUICK_REFERENCE.md
- [ ] Fez `git checkout -b sprint-5/chat`
- [ ] Criou pastas (conversas, chat)
- [ ] Criou src/types/message.ts
- [ ] Criou src/lib/validations/message.ts
- [ ] Fez `git commit "chore: setup Sprint 5"`
- [ ] `npm run dev` rodando
- [ ] Pronto! 🚀

**TEMPO:** 1 hora total

---

## 🎯 SEMANA 1 (Seus dias)

```
SEG (01):  US-059 - Listar      → 1.5h
TER (02):  US-060 - Ver chat    → 2.0h
QUA (03):  US-061 - Enviar      → 1.5h
QUI (04):  US-062 - Badge       → 0.5h
SEX (05):  Testes + Polimento   → 1.5h
─────────────────────────────────────
TOTAL:                              9h
BUFFER:      ~30h livre
CHANCE:      95%+ sucesso
```

---

## 🌟 LEMBRE-SE

> **KISS = Keep It Simple, Stupid**
>
> Você NÃO precisa de:
> • Realtime
> • Notificações
> • Media upload
> • Voz/Vídeo
> • Chatbot
>
> Você SÓ precisa de:
> • Chat funcional
> • Simples
> • Rápido
> • Pronto para produção

---

## 🎉 FIM

**Status:** ✅ PRONTO  
**Confiança:** 🔴 MÁXIMA  
**Pragmatismo:** 🎯 KISS  

**Next step:** Abre `SPRINT5_QUICK_REFERENCE.md`

**Let's build! 🚀**

---

```
╔════════════════════════════════════════════════════════════════════╗
║                                                                    ║
║        📍 IMPRIMA E COLE ESTE CARTÃO NA SUA PAREDE 📍           ║
║                                                                    ║
║                  Você vai conseguir! 💪                          ║
║                                                                    ║
╚════════════════════════════════════════════════════════════════════╝
```
