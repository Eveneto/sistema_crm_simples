# 📋 Sprint 5 - Action Plan (RESUMO EXECUTIVO)

**Data:** 30/11/2025  
**Status:** ✅ PRONTO PARA COMEÇAR  
**Prioridade:** 🔴 CHAT (100% do foco)

---

## 🎯 O Essencial (TL;DR)

### Sprint 5 = CHAT
- Listar conversas
- Visualizar chat
- Enviar mensagens
- Badge de não lido

**Nada mais!** Sem Realtime, sem notificações, sem media upload.

### Timeline
- **Semana 1 (Seg-Sex, 01-05/12):** Implementar chat core
- **Semana 2 (Seg-Fri, 08-12/12):** Polimento + Sprint 6 prep

### Velocidade
**Estimado: 8-10 horas total** (3 user stories de 5pts cada)

---

## ✅ Status PRÉ-SPRINT

| Item | Status | Ação |
|------|--------|------|
| **DB Tables** | ✅ EXISTEM | Nada |
| **RLS Policies** | ✅ PRONTAS | Nada |
| **Types criados** | ❌ TODO | Criar hoje |
| **Branch criada** | ❌ TODO | Criar hoje |
| **Pastas setup** | ❌ TODO | Criar hoje |

---

## 🚀 Como Começar (Agora)

### Step 1: Criar Branch (2 min)
```bash
git checkout -b sprint-5/chat
```

### Step 2: Criar Pastas (2 min)
```bash
mkdir -p src/app/\(dashboard\)/dashboard/conversas/{[id]}
mkdir -p src/components/chat
```

### Step 3: Criar Types (10 min)
Arquivo: `src/types/message.ts`
```typescript
export interface Conversation {
  id: string;
  contact_id: string;
  user_id: string;
  last_message?: string;
  is_read: boolean;
  created_at: string;
  updated_at: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  user_id: string;
  content: string;
  created_at: string;
}
```

### Step 4: Criar Schemas (10 min)
Arquivo: `src/lib/validations/message.ts`
```typescript
import { z } from "zod";

export const createMessageSchema = z.object({
  conversation_id: z.string().uuid(),
  content: z.string().min(1).max(2000),
});
```

### Step 5: Primeiro Commit (2 min)
```bash
git add src/types/message.ts src/lib/validations/message.ts
git commit -m "chore: setup Sprint 5 structure"
```

**Total: ~30 minutos**

---

## 📋 User Stories (4 Total = 18 pts)

### US-059: Listar Conversas (5 pts) ✅
```
Página: /dashboard/conversas
Mostra: Lista de conversas (contact, last msg, timestamp)
Tempo: 1.5h
```

### US-060: Visualizar Chat (5 pts) ✅
```
Página: /dashboard/conversas/[id]
Mostra: Histórico de mensagens
Tempo: 2h
```

### US-061: Enviar Mensagem (5 pts) ✅
```
Endpoint: POST /api/messages
Ação: Insere mensagem no DB
Tempo: 1.5h
```

### US-062: Badge Não Lido (3 pts) ✅
```
Feature: Marca conversa como lida
API: PATCH /api/conversations/[id]/read
Tempo: 0.5h
```

---

## 🏗️ Arquitetura (MINIMAL)

### Components
```
src/components/chat/
├── conversation-list.tsx      # Lista de conversas
├── conversation-item.tsx      # Item individual
├── chat-window.tsx            # Container do chat
├── message-list.tsx           # Lista de msgs
├── message-item.tsx           # Msg individual
└── message-input.tsx          # Input + envio
```

### Pages
```
src/app/(dashboard)/dashboard/conversas/
├── page.tsx                   # Lista conversas
└── [id]/page.tsx              # Chat individual
```

### API
```
src/app/api/
├── messages/
│   └── route.ts              # POST (enviar msg)
└── conversations/
    └── [id]/read/route.ts    # PATCH (mark as read)
```

---

## 🎯 Dia 1 (Seg 01/12) - Listar Conversas

**Objetivo:** Ver lista de conversas

**Arquivos a Criar:**
1. `src/app/(dashboard)/dashboard/conversas/page.tsx` (80 linhas)
2. `src/components/chat/conversation-list.tsx` (60 linhas)
3. `src/components/chat/conversation-item.tsx` (50 linhas)

**Checklist:**
- [ ] Page carrega todas as conversas
- [ ] Conversas mostram: contact name, last message, time
- [ ] Ordenado por data (descending)
- [ ] Link ao clicar em conversa
- [ ] Empty state se 0 conversas
- [ ] Loading skeleton
- [ ] Commit: `feat: implement US-059 (list conversations)`

**Resultado esperado:**
```
[Conversa 1]  "Oi!" - 14:30
[Conversa 2]  "Qual preço?" - 13:45
[Conversa 3]  "Tudo bem?" - 12:00
```

---

## 🎯 Dia 2 (Ter 02/12) - Visualizar Chat

**Objetivo:** Abrir conversa e ver histórico

**Arquivos a Criar:**
1. `src/app/(dashboard)/dashboard/conversas/[id]/page.tsx` (100 linhas)
2. `src/components/chat/chat-window.tsx` (50 linhas)
3. `src/components/chat/message-list.tsx` (70 linhas)
4. `src/components/chat/message-item.tsx` (60 linhas)

**Checklist:**
- [ ] Page carrega conversa e mensagens
- [ ] Mensagens mostram: content, sender, timestamp
- [ ] Msgs do user = direita (blue), do contact = esquerda (gray)
- [ ] Scroll automático para última msg
- [ ] Nome do contato no header
- [ ] Loading enquanto busca
- [ ] Back button funciona
- [ ] Commit: `feat: implement US-060 (view chat)`

**Resultado esperado:**
```
┌─ João Silva ─┐
│              │
│       Oi!    │ (14:30)
│ text response│
│ (14:32)      │
│              │
│ Digite msg...│
└──────────────┘
```

---

## 🎯 Dia 3 (Qua 03/12) - Enviar Mensagem

**Objetivo:** Usuário consegue enviar msg

**Arquivos a Criar:**
1. `src/app/api/messages/route.ts` (60 linhas)
2. `src/components/chat/message-input.tsx` (50 linhas)

**Checklist:**
- [ ] API POST /api/messages funciona
- [ ] Validação com Zod
- [ ] Auth check (401 sem user)
- [ ] Insere em DB
- [ ] Atualiza conversation.updated_at
- [ ] MessageInput form com React Hook Form
- [ ] Optimistic update (add local)
- [ ] Clear field after submit
- [ ] Toast de sucesso
- [ ] Rollback se falhar
- [ ] Commit: `feat: implement US-061 (send message)`

**Resultado esperado:**
```
[Tipo menssagem]
[Botão Enviar]
    ↓
✅ Msg aparece no chat
✅ Clear input
✅ Toast "Mensagem enviada"
```

---

## 🎯 Dia 4 (Qui 04/12) - Badge Não Lido

**Objetivo:** Saber quais conversas têm mensagens novas

**Arquivos a Criar:**
1. `src/app/api/conversations/[id]/read/route.ts` (40 linhas)

**Checklist:**
- [ ] Mostrar badge (número) se !is_read
- [ ] Ao abrir chat, chama PATCH /conversations/[id]/read
- [ ] Marca is_read = true no DB
- [ ] Badge desaparece
- [ ] Commit: `feat: implement US-062 (unread badge)`

**Resultado esperado:**
```
[Conversa 1] 🔴 (novo)
[Conversa 2] (lido)
[Conversa 3] (lido)

↓ abre conversa

[Conversa 1] (badge desapareceu)
```

---

## 🎯 Dia 5 (Sex 05/12) - Buffer & Polimento

- Corrigir bugs encontrados
- Code review
- Documentação
- Commit final

---

## 🧪 Testes (SIMPLES)

**Cobertura alvo: 50%**

```
✅ conversation-list.test.tsx (render, link)
✅ chat-window.test.tsx (load msgs)
✅ message-input.test.tsx (submit form)
✅ api/messages (POST validation)
```

**NÃO fazer:**
- ❌ E2E tests
- ❌ Performance tests
- ❌ Accessibility tests

---

## 📊 Métricas de Sucesso

| Métrica | Meta |
|---------|------|
| Chat funciona 100% | ✅ |
| Sem erros TypeScript | ✅ |
| Testes rodando | ✅ (80%+) |
| ESLint warnings | ⚠️ ok ter |
| Build sem erros | ✅ |
| Deploy staging | ✅ |

---

## 📞 Padrões Reutilizar

**Copia essas estruturas de Sprint 4:**

```typescript
// 1. Server-side auth
import { supabaseServer } from "@/lib/supabase";
const { user } = await supabaseServer.auth.getUser();
if (!user) redirect("/login");

// 2. API route
export async function POST(request: Request) {
  const data = await request.json();
  const validated = createMessageSchema.parse(data);
  // ... insert DB
  return NextResponse.json(result);
}

// 3. Form submit
const onSubmit = async (data) => {
  const response = await fetch("/api/messages", {
    method: "POST",
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error();
  toast({ title: "Sucesso" });
};

// 4. Toast
const { toast } = useToast();
```

---

## 🚫 Cuidado - Pitfalls

1. **❌ Esquecer RLS** → Usuários não conseguem acessar dados
2. **❌ Sem validação Zod** → Dados inválidos na DB
3. **❌ Sem índices** → Queries lentas
4. **❌ Realtime** → Sai do escopo KISS
5. **❌ Múltiplos endpoints desnecessários** → Complexidade

---

## 📅 Semana 2 (Opcional)

Se acabar cedo:

```
✅ US-063: Melhorias UX
  - Timestamps relativos ("há 5 min")
  - Avatar do contato
  - Typing indicator visual

✅ US-064: Finalizar Sprint 4
  - Deal Details Modal
  - Close Deal funcionalidade
  - ESLint cleanup

✅ US-065: Testes Chat
  - Cobertura 80%+

✅ US-066: Deploy Staging
  - Testar em staging
  - Fix issues encontrados
```

---

## 🔄 Depois (Sprint 6+)

**Deixar para depois:**
- Realtime WebSockets
- Notificações push
- Integração WhatsApp
- File uploads
- Voice/Video
- Search em mensagens
- Archive conversas

---

## 🎯 SUCESSO DA SPRINT = ?

**Fim do período (14/12):**

```
✅ Users conseguem:
   1. Ver lista de conversas
   2. Abrir chat com cliente
   3. Enviar mensagens
   4. Ver quando tem mensagem nova

✅ Código:
   - Sem erros TypeScript
   - Testes rodando
   - Ready para deploy

❌ Não tem (e tá ok):
   - Realtime
   - Notificações
   - Arquivo
   - Voz/Vídeo
```

---

## 📦 Deliverables

```
📄 Código:
  ├── 6 componentes chat
  ├── 2 pages conversas
  ├── 2 API endpoints
  └── 4-5 testes

📊 Documentação:
  ├── Comments no código
  ├── README.md (chat usage)
  └── API docs

🎬 Demo:
  ├── Video de funcionalidades
  ├── Screenshots
  └── User feedback
```

---

## ✅ CHECKLIST ANTES DE COMEÇAR

Você vai fazer **agora mesmo:**

- [ ] Cria branch `sprint-5/chat`
- [ ] Cria pastas (conversas, components/chat)
- [ ] Cria `src/types/message.ts`
- [ ] Cria `src/lib/validations/message.ts`
- [ ] Faz primeiro commit
- [ ] Confirma `npm run dev` rodando

**Tempo:** 30 minutos ⏱️

---

## 🚀 Começar Agora?

**Vou fazer:**

1. ✅ Criar tipos e validações
2. ✅ Criar estrutura de pastas
3. ✅ Primeiro commit
4. ✅ Pronto para desenvolviment!

**Você dirá:** "Pode começar!" ✅

---

**Status:** 🟢 READY TO START  
**Prioridade:** 🔴 CHAT ONLY  
**Princípio:** 🎯 KEEP IT SIMPLE

**Let's build! 🚀**

---

*Criado em 30/11/2025 - 14:45*
*Última atualização: HOJE*
