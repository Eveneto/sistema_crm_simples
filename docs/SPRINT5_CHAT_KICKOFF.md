# 🚀 SPRINT 5: CHAT IMPLEMENTATION KICKOFF

**Data:** 30 de novembro de 2025  
**Objetivo:** Implementar Chat funcional AGORA  
**Abordagem:** KISS - Máximo impacto, mínima complexidade

---

## 🎯 ESTRATÉGIA DE LIBERAÇÃO

### Fase 1: Preparar App Atual (Hoje/Amanhã - 2h)
```
[ ] Limpar Sprint 4 pendências
[ ] Setup Chat API skeleton
[ ] Types + Validations
[ ] Database review
```

### Fase 2: Chat Básico (01-05/12 - 3 dias)
```
[ ] List conversations (2h)
[ ] View conversation (2h)
[ ] Send message (1.5h)
[ ] Tests básicos (1.5h)
```

### Fase 3: Release MVP (06-10/12)
```
[ ] Deploy staging
[ ] Testes de qualidade
[ ] Bug fixes
[ ] Deploy produção
```

---

## 📋 TODO NOW (Hoje 30/11)

### 1. Verificar Status Sprint 4

```bash
# O que está faltando?
FALTA:
- Deal Details Modal (1.5h) - Fácil
- Close Deal Logic (1.5h) - Muito fácil
- Alguns polishes

DECISÃO: 
Termina isso AGORA (amanhã 01/12) ou pula direto para Chat?

RECOMENDAÇÃO: 
Termina (leva só 3h) + faz Sprint 4 completo + aí sai Chat.
```

### 2. Setup Chat API (Agora!)

```bash
# Criar estrutura:
src/app/api/
├── messages/
│   ├── route.ts (POST - enviar mensagem)
│   └── read/[id].ts (PATCH - marcar como lido)
├── conversations/
│   ├── route.ts (GET - listar conversas)
│   └── [id]/
│       ├── route.ts (GET - detalhes conversa)
│       └── read/route.ts (PATCH - marcar conversa como lida)
```

### 3. Types + Validations

```typescript
// src/lib/validations/message.ts
createMessageSchema: Zod

// src/lib/validations/conversation.ts
conversationFiltersSchema: Zod
```

### 4. Database Review

```sql
-- Verificar:
✅ conversations table (exists?)
✅ messages table (exists?)
✅ RLS policies (active?)
✅ Indexes (exist?)
```

---

## 🏗️ ARQUITETURA CHAT (SIMPLES)

### Database (Já existente, verificar)

```sql
-- conversations
CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id),
  contact_id UUID NOT NULL REFERENCES contacts(id),
  last_message_at TIMESTAMP,
  last_read_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- messages
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID NOT NULL REFERENCES conversations(id),
  user_id UUID NOT NULL REFERENCES users(id),
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT now()
);

-- Indexes
CREATE INDEX idx_conversations_user ON conversations(user_id);
CREATE INDEX idx_messages_conversation ON messages(conversation_id);
```

### API Pattern (REST simples)

```typescript
// GET /api/conversations
// Retorna: Conversation[] com last_message, contact, unread_count

// GET /api/conversations/[id]
// Retorna: Conversation + all messages (paginated)

// POST /api/messages
// Input: { conversation_id, content }
// Retorna: Message criada

// PATCH /api/conversations/[id]/read
// Marca como lido + retorna unread_count
```

### Components (MVP simples)

```
chat/
├── conversation-list.tsx
│   ├── Lista conversas
│   ├── Badge unread
│   └── Search/filter
├── conversation-item.tsx
│   ├── Contact info
│   ├── Last message preview
│   └── Unread badge
├── chat-window.tsx
│   ├── Header (contact info)
│   ├── message-list.tsx
│   ├── message-item.tsx
│   └── message-input.tsx
└── message-input.tsx
    ├── Input field
    ├── Send button
    └── Loading state
```

### Pages (Routing)

```
/dashboard/conversas/
├── page.tsx (lista conversas)
└── [id]/page.tsx (ver chat)
```

---

## 🎯 DECISÃO AGORA

### Opção A: Terminar Sprint 4 + Chat

```
TIMELINE:
01/12 (AMANHÃ): Deal details + close (3h)
02-05/12: Chat basic (9h)
06-10/12: Polish + Deploy

VANTAGEM: Sprint 4 completo, MVP maior
DESVANTAGEM: Chat demora mais
```

### Opção B: Pular Sprint 4 pending + Chat

```
TIMELINE:
01-05/12: Chat basic (9h)
Depois: Deal details + close

VANTAGEM: Chat sai rápido
DESVANTAGEM: Sprint 4 fica incompleto
```

### 🎲 RECOMENDAÇÃO: Opção A

**Por quê?**
- Sprint 4 leva só 3h
- Fica tudo organizado
- MVP fica maior
- Chat não é mais urgente que limpar Sprint 4
- Depois sai produção completa

**Ação agora:**
1. ✅ Confirma com você
2. ✅ Amanhã termina Sprint 4 (3h)
3. ✅ Segunda inicia Chat

---

## 📊 TIMELINE FINAL (Opção A)

```
MON 01/12 (Tomorrow):
├─ 09:00 - Deal Details Modal (1.5h)
├─ 10:30 - Close Deal Logic (1.5h)
├─ 12:00 - Testes Sprint 4
└─ 12:30 - Deploy staging

TUE-FRI 02-05/12 (Polish Sprint 4):
├─ Code review
├─ Bug fixes
└─ Documentação

MON 06/12 (Chat Start):
├─ Setup API skeleton (1h)
├─ List conversations (2.5h)
├─ View conversation (2.5h)
└─ Testes

WED 08/12:
├─ Send message (2h)
├─ Tests (1.5h)
└─ Polish

THU-FRI 09-10/12:
├─ Final testing
├─ Deploy staging
└─ Code review

MON-WED 13-15/12:
├─ Final polish
├─ Deploy produção
└─ 🎉 MVP em produção!
```

---

## ✅ CHECKLIST: O QUE FAZER AGORA

### TODAY (30/11 - Agora!)

```
[ ] Ler este documento
[ ] Confirmar Opção A (terminar Sprint 4 + Chat)
[ ] Criar branch sprint-5/chat-implementation
[ ] Começar a ler código existente
```

### TOMORROW (01/12)

```
[ ] Deal Details Modal (1.5h)
[ ] Close Deal Logic (1.5h)
[ ] Run tests
[ ] Deploy staging
[ ] Merge para main
```

### SEGUNDA (06/12)

```
[ ] Chat API setup
[ ] List conversations endpoint
[ ] Conversation list component
[ ] Tests
```

---

## 🎯 SUCCESS CRITERIA

### Sprint 4 Final

```
✅ Deal Details Modal - DONE
✅ Close Deal Logic - DONE
✅ Testes passando
✅ 0 bugs críticos
✅ Deploy em staging
```

### Chat MVP

```
✅ List conversations
✅ View conversation + messages
✅ Send message
✅ Unread badge
✅ Tests 80%+
✅ Deploy em staging
```

### Production Release

```
✅ MVP 100% funcional
✅ Zero bugs conhecidos
✅ Documentação completa
✅ Tests passing
✅ Deploy produção
```

---

## 📚 DOCUMENTOS CRIADOS (Para referência)

Você já tem tudo planejado em docs/:

1. **MVP_ANALYSIS_COM_CHAT.md** - Análise completa
2. **MVP_FINISH_STRATEGY.md** - Strategy detalhada
3. **MVP_EXECUTIVE_SUMMARY.md** - Resumo rápido
4. **SUPABASE_FERRAMENTAS_CHAT.md** - Tech details
5. **SPRINT5_TECNOLOGIAS_ANALISE.md** - Technology choices

---

## 🚀 PRÓXIMO PASSO

### AGORA (Este momento):
1. Você decide: Opção A ou B?
2. Eu começo a implementar

### Recomendo:
```
Opção A: Termina Sprint 4 + Chat
├─ Amanhã: Sprint 4 final (3h)
├─ Segunda: Chat (9h)
└─ 15/12: MVP em produção!
```

---

**Status:** 🎯 Preparado para iniciar  
**Próximo:** Sua confirmação!  
**Confiança:** ✅ 95%+ sucesso

---
