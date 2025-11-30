# 🚀 Sprint 5 - KICKOFF (CHAT FIRST)

**Data:** 01/12/2025 - 14/12/2025 (2 semanas)  
**Sprint Goal:** "Implementar chat funcional end-to-end"  
**Lema:** "KISS - Keep It Simple, Stupid"

---

## 🎯 Objetivo Principal

**Chat é a prioridade #1 dessa sprint.** Tudo mais vem depois.

### Por quê?
- Funcionalidade essencial de CRM
- Simples de implementar (não requer backend complexo)
- Alto impacto no valor percebido do produto
- Baixo risco técnico

---

## 📊 Sprint Backlog (TOTAL: 30 Story Points)

### 🔴 CRÍTICA - Chat (18 pts) - SEMANA 1 COMPLETA

#### US-059: Listar Conversas (5 pts) ✅
**Como** atendente  
**Quero** ver todas as conversas com clientes  
**Para** saber quem precisa de atendimento

**Critérios Mínimos:**
- [ ] Página `/dashboard/conversas`
- [ ] Lista de conversas com contato, último msg, timestamp
- [ ] Conectar com table `conversations` do Supabase
- [ ] Ordenar por data (mais recente primeiro)
- [ ] Status de lido/não lido

**Design Simples (KISS):**
```
┌─────────────────────────┐
│ Conversas (Lista)       │
├─────────────────────────┤
│ João Silva              │
│ "Olá, tudo bem?"  14:30 │
├─────────────────────────┤
│ Maria Santos            │
│ "Qual é o preço?"  13:45 │
└─────────────────────────┘
```

**Tarefas Técnicas:**
- [ ] Criar page.tsx em `/dashboard/conversas`
- [ ] Query Supabase: `SELECT * FROM conversations ORDER BY updated_at DESC`
- [ ] Componente `ConversationList.tsx`
- [ ] Componente `ConversationItem.tsx`
- [ ] Skeleton loader
- [ ] Empty state

**Arquivos a Criar:**
```
src/app/(dashboard)/dashboard/conversas/
  └── page.tsx                      (80 linhas)
  
src/components/chat/
  ├── conversation-list.tsx         (60 linhas)
  └── conversation-item.tsx         (50 linhas)
```

**Testes (Mínimos):**
- [ ] Render list com > 0 conversas
- [ ] Ordenação correta
- [ ] Empty state quando 0 conversas
- [ ] Click navega para detalhe

**Estimativa:** 1-1.5h  
**Responsável:** [Você]

---

#### US-060: Visualizar Chat (5 pts) ✅
**Como** atendente  
**Quero** ver histórico de mensagens com cliente  
**Para** continuar conversação anterior

**Critérios Mínimos:**
- [ ] Página `/dashboard/conversas/[id]`
- [ ] Lista de mensagens (minha msg vs cliente msg)
- [ ] Campo input para enviar mensagem
- [ ] Loading state enquanto busca
- [ ] Sem refresh - usa query normal (não Realtime ainda)

**Design Simples:**
```
┌──────────────────────────┐
│ João Silva               │
├──────────────────────────┤
│                          │
│         Olá!     (14:30) │
│                          │
│ Oi, como posso ajudar?   │
│                          │
│         Qual o preço?    │
│         (14:35)          │
├──────────────────────────┤
│ [Digite a mensagem...] │Send│
└──────────────────────────┘
```

**Tarefas Técnicas:**
- [ ] Criar page.tsx `/dashboard/conversas/[id]`
- [ ] Query: `SELECT * FROM messages WHERE conversation_id = {id}`
- [ ] Componente `ChatWindow.tsx` (container)
- [ ] Componente `MessageList.tsx`
- [ ] Componente `MessageItem.tsx` (left/right)
- [ ] Componente `MessageInput.tsx`
- [ ] Scroll to bottom

**Arquivos a Criar:**
```
src/app/(dashboard)/dashboard/conversas/[id]/
  └── page.tsx                      (100 linhas)
  
src/components/chat/
  ├── chat-window.tsx               (50 linhas)
  ├── message-list.tsx              (70 linhas)
  ├── message-item.tsx              (60 linhas)
  └── message-input.tsx             (50 linhas)
```

**Testes:**
- [ ] Load messages corretos
- [ ] Scroll funciona
- [ ] Input limpa após envio
- [ ] Timestamp exibido

**Estimativa:** 1.5-2h  
**Responsável:** [Você]

---

#### US-061: Enviar Mensagem (5 pts) ✅
**Como** atendente  
**Quero** enviar mensagem para cliente  
**Para** responder dúvidas

**Critérios Mínimos:**
- [ ] Clicar "Enviar" insere mensagem no DB
- [ ] Campo limpa automaticamente
- [ ] Mensagem aparece no chat imediatamente
- [ ] Toast de sucesso/erro
- [ ] Validação: não enviar vazio

**Tarefas Técnicas:**
- [ ] API `POST /api/messages` (novo endpoint)
  - Body: `{ conversation_id, content, user_id }`
  - Valida com Zod
  - Insere em `messages` table
  - Atualiza `conversations.updated_at`
  - Retorna message criada
  
- [ ] Validação Zod:
  ```typescript
  const createMessageSchema = z.object({
    conversation_id: z.string().uuid(),
    content: z.string().min(1).max(2000),
  });
  ```

- [ ] Atualizar `MessageInput.tsx`:
  - Form com React Hook Form
  - POST para `/api/messages`
  - Otimistic update (add local antes de confirmar)
  - Rollback se falhar
  - Clear field on success

**Arquivo:**
```
src/app/api/messages/
  └── route.ts                      (60 linhas)
```

**Testes:**
- [ ] POST com dados válidos
- [ ] 401 sem auth
- [ ] Validação de conteúdo vazio
- [ ] Atualiza conversation.updated_at

**Estimativa:** 1-1.5h  
**Responsável:** [Você]

---

#### US-062: Badge de Não Lido (3 pts) ✅
**Como** atendente  
**Quero** saber quais conversas tenho novas mensagens  
**Para** priorizar atendimento

**Critérios Mínimos:**
- [ ] Badge de count em cada conversa
- [ ] Badge desaparece ao abrir chat
- [ ] Marcar como lido ao abrir

**Tarefas Técnicas:**
- [ ] API `PATCH /api/conversations/[id]/read`
  - Marca `is_read = true`
  - Retorna conversation

- [ ] Atualizar `ConversationItem`:
  - Mostrar badge se `!is_read`
  - Count de mensagens não lidas

- [ ] Em `conversas/[id]/page.tsx`:
  - Chamar PATCH ao montar
  - Update local state

**Estimativa:** 0.5h

---

### 🟡 MÉDIA - Polimento Chat (5 pts) - SEMANA 2

#### US-063: Melhorias UX Chat (5 pts)
**Opcionais se sobrar tempo:**
- [ ] Timestamps "há 5 minutos" (relative time)
- [ ] Avatar/foto do cliente
- [ ] Typing indicator (avatar piscando)
- [ ] Emoji support
- [ ] Scroll automático
- [ ] Search em mensagens

**NÃO FAÇA:** Realtime, notificações, media upload, encryption

---

### 🟢 BAIXA - Preparação Sprint 6 (7 pts) - SEMANA 2

#### US-064: Finalizar Pipeline (3 pts)
**Fechar pendências do Sprint 4:**
- [ ] Deal Details Modal
- [ ] Close Deal (won/lost)
- [ ] ESLint warnings

**Estimativa:** 1-1.5h

#### US-065: Testes Chat (3 pts)
**Cobertura mínima:**
- [ ] Lista conversas
- [ ] Load chat
- [ ] Enviar mensagem
- [ ] Badge atualiza

**Estimativa:** 1h

#### US-066: Deploy Staging (1 pt)
- [ ] Push para Vercel
- [ ] Testar em staging

---

## 📅 Timeline Detalhado (KISS - 2 SEMANAS)

### **SEMANA 1: Chat Core (Segunda - Sexta)**

#### **Dia 1 (Seg, 01/12)** - Setup + US-059

- [ ] Estruturar pastas
- [ ] Criar DB table `conversations` (já existe?)
- [ ] Implementar US-059 (Listar Conversas)
  - Page + components
  - Query DB
  - Testes básicos
- **Daily:** 2h

#### **Dia 2 (Ter, 02/12)** - US-060

- [ ] Implementar US-060 (Visualizar Chat)
  - Page + components
  - Load messages
  - UI responsiva
- **Daily:** 2h

#### **Dia 3 (Qua, 03/12)** - US-061

- [ ] API endpoint `POST /api/messages`
- [ ] Implementar envio de mensagem
- [ ] Otimistic updates
- [ ] Testes
- **Daily:** 2h

#### **Dia 4 (Qui, 04/12)** - US-062

- [ ] Badge de não lido
- [ ] Mark as read
- [ ] Testes
- **Daily:** 1h

#### **Dia 5 (Sex, 05/12)** - Buffer + Polimento

- [ ] Corrigir bugs encontrados
- [ ] Code review
- [ ] Refactor se necessário
- [ ] Documentation
- **Daily:** 2h

**Semana 1 Total:** ~9h (bem abaixo de 8h/dia)

---

### **SEMANA 2: Polimento + Sprint 6 Prep (Segunda - Sexta)**

#### **Dia 6-7 (Seg-Ter, 08-09/12)** - Melhorias UX + Testes

- [ ] US-063 (melhorias se houver tempo)
- [ ] US-065 (testes chat)
- [ ] Refactor componentes
- **Daily:** 2h cada

#### **Dia 8 (Qua, 10/12)** - Pipeline Cleanup

- [ ] US-064 (finalizar sprint 4)
- [ ] ESLint warnings
- [ ] Fix bugs reportados
- **Daily:** 2h

#### **Dia 9 (Qui, 11/12)** - Deploy + Sprint 6 Plan

- [ ] US-066 (deploy staging)
- [ ] Testar end-to-end
- [ ] Começar planejamento Sprint 6
- **Daily:** 2h

#### **Dia 10 (Sex, 12/12)** - Sprint Review

- [ ] Demo funcionalidades
- [ ] Feedback
- [ ] Retrospective

---

## 🏗️ Arquitetura (KISS)

### Database Tables

**Já devem existir:**
```sql
-- Conversas (lista de chat)
CREATE TABLE conversations (
  id UUID PRIMARY KEY,
  contact_id UUID REFERENCES contacts(id),
  user_id UUID REFERENCES users(id),
  last_message TEXT,
  updated_at TIMESTAMP,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP
);

-- Mensagens
CREATE TABLE messages (
  id UUID PRIMARY KEY,
  conversation_id UUID REFERENCES conversations(id),
  user_id UUID REFERENCES users(id),
  content TEXT NOT NULL,
  created_at TIMESTAMP
);
```

### API Endpoints (Minimalistas)

```
GET  /api/conversations           # Listar
GET  /api/conversations/[id]      # Detalhes + mensagens
POST /api/messages                # Enviar
PATCH /api/conversations/[id]/read # Mark as read
```

### Component Tree

```
dashboard/conversas/
├── page.tsx (Server)
└── ConversationList
    └── ConversationItem (Link)

dashboard/conversas/[id]/
├── page.tsx (Server, carrega chat)
└── ChatWindow
    ├── MessageList
    │   └── MessageItem (Left/Right)
    └── MessageInput (Form)
```

---

## ⚠️ Restrições KISS

### ✅ FAÇA:
- REST APIs simples
- React Hook Form + Zod
- Optimistic updates local
- Toast notifications
- Basic loading states
- Timestamps simples (ISO format)

### ❌ NÃO FAÇA:
- Realtime com WebSockets
- Supabase Realtime
- Typing indicators
- Delivery receipts
- Read receipts em tempo real
- File uploads
- Encryption
- Voice/video
- Chatbot

### 📋 Deixar para Sprint 6+:
- Integração WhatsApp
- Notificações push
- Multi-user chat
- Channel organization
- Search avançado
- Archive conversas

---

## 🧪 Testes (MÍNIMOS)

**Cobertura alvo: 50%+ (pragmático)**

### Unit Tests
```
✅ API endpoints (2-3 testes cada)
✅ Componentes (render, click)
✅ Validations (Zod schemas)
```

### Integration Tests
```
⚠️ Uma ponta a ponta de chat
```

### NÃO FAZER:
- E2E com Playwright
- Performance tests
- Load tests
- Accessibility tests

---

## 📊 Definition of Done

**Uma user story é "pronta" quando:**

1. ✅ Código escrito e compilado
2. ✅ Funciona em dev local
3. ✅ Testes unitários passam
4. ✅ Sem erros TypeScript
5. ✅ Documentado (comentários)
6. ✅ Code review feito
7. ✅ Merged em sprint-4 branch

**NÃO é necessário:**
- ❌ ESLint 0 errors (podem ter warnings)
- ❌ 100% coverage
- ❌ Performance otimizada
- ❌ Mobile-perfect
- ❌ Documentação detalhada

---

## 🚨 Riscos (BAIXOS)

| Risco | Probabilidade | Impacto | Mitigação |
|-------|---------------|---------|-----------|
| DB schema não existe | Baixa | Alto | Verificar schema hoje |
| Testes quebram | Média | Baixo | Testes simples |
| Slow queries | Baixa | Médio | Indexes básicos |
| Auth issues | Baixa | Alto | Reutilizar padrão Sprint 4 |

---

## 📈 Métricas de Sucesso

| Métrica | Meta | Pragmatismo |
|---------|------|-------------|
| Chat funcionando | 100% ✅ | Sem Realtime ok |
| Testes rodando | 80%+ | Cobertura simples |
| Build sem erros | 100% ✅ | TypeScript sim, ESLint skip |
| Performance | Aceitável | <3s load |
| Type-safe | 95%+ | Poucos any |

---

## 📋 Checklist Pré-Sprint

- [ ] Verificar se tables `conversations` e `messages` existem
- [ ] Confirmar autenticação funciona em Sprint 4
- [ ] Setup branch `sprint-5/chat`
- [ ] Estruturar pastas
- [ ] Preparar tipos TypeScript básicos
- [ ] Testes de conexão Supabase

---

## 🎯 Sucesso = ?

**Fim da Sprint 5:**

```
✅ User consegue:
1. Ver lista de conversas
2. Abrir chat com cliente
3. Enviar mensagem
4. Ver badge de não lido

✅ Código:
- Sem erros TypeScript
- Testes rodando (80%+)
- Documentado
- Ready para produção

❌ Não tem:
- Realtime
- Notificações
- Arquivo
- Voz/Vídeo
```

---

## 🔄 Próxima Sprint (Sprint 6)

**Foco:** Contatos + Atividades + Dashboard

```
US-048: Contatos CRUD (6 pts)
US-049: Atividades/Tasks (4 pts)
US-050: Dashboard Métricas (4 pts)
US-051: Deploy to Prod (2 pts)

Total: 16 pts (Buffer: pode ajustar)
```

---

## 📞 Suporte

**Dúvidas?** Procura por:
1. Código de Sprint 4 como referência
2. Padrões já usados (types, validations, API)
3. Reutiliza components quando possível

**Não reinventa roda!**

---

**Sprint Status:** 🟡 PLANEJADO  
**Prioridade Absoluta:** 🔴 CHAT  
**Princípio:** 🎯 KISS (Keep It Simple, Stupid)

---

*Criado em 30/11/2025*
*Versão: 1.0 - FINAL*
