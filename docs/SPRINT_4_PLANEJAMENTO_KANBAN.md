# Sprint 4 - Pipeline de Vendas (Kanban)

**Início:** 12/12/2024  
**Duração:** 2 semanas  
**Meta:** 30 pontos (100%)  
**Foco:** Pipeline visual de negócios com drag-and-drop

---

## 🎯 Objetivo da Sprint 4

Implementar um **sistema de gerenciamento de negócios** com visualização em Kanban, permitindo que o usuário:

- Visualize todos os negócios em um pipeline visual (colunas por estágio)
- Crie, edite e gerencie negócios
- Mova negócios entre estágios com drag-and-drop
- Associe negócios a contatos existentes
- Defina valores e marque negócios como ganhos/perdidos

---

## 📋 User Stories

### Epic 5: CRM - Pipeline de Vendas

#### US-038: Visualizar Kanban de Negócios (5 pts)

**Como** vendedor  
**Quero** ver todos os negócios organizados por estágio  
**Para** ter visão clara do pipeline

**Critérios de Aceitação:**

- [ ] Exibir colunas de estágios (Lead, Qualificação, Proposta, Negociação, Fechado)
- [ ] Cada coluna mostra cards dos negócios
- [ ] Cards mostram: título, valor, contato, data de criação
- [ ] Badge colorido por status (lead, em andamento, ganho, perdido)
- [ ] Contador de negócios por coluna
- [ ] Valor total por coluna
- [ ] Scroll horizontal se muitas colunas
- [ ] Responsivo (mobile mostra uma coluna por vez)

**Tarefas Técnicas:**

- [ ] Criar página `/dashboard/deals/pipeline/page.tsx`
- [ ] Criar componente `PipelineBoard.tsx`
- [ ] Criar componente `PipelineColumn.tsx`
- [ ] Criar componente `DealCard.tsx`
- [ ] API GET `/api/deals` com filtro por estágio
- [ ] Query SQL para buscar deals com joins (contact, stage)
- [ ] Testes: PipelineBoard, PipelineColumn, DealCard

---

#### US-039: Criar Novo Negócio (3 pts)

**Como** vendedor  
**Quero** criar um novo negócio  
**Para** começar a acompanhar uma oportunidade

**Critérios de Aceitação:**

- [ ] Botão "Novo Negócio" no header do pipeline
- [ ] Formulário com campos: título*, contato*, estágio\*, valor, data esperada
- [ ] Validação Zod: título obrigatório, valor numérico positivo
- [ ] Autocomplete de contatos (busca por nome/email)
- [ ] Após criar, card aparece na coluna correta
- [ ] Toast de sucesso

**Tarefas Técnicas:**

- [ ] Criar componente `DealForm.tsx`
- [ ] API POST `/api/deals`
- [ ] Validação: `src/lib/validations/deal.ts`
- [ ] Insert SQL com transaction (deal + deal_stage)
- [ ] Testes: validação + API POST

---

#### US-040: Editar Negócio (3 pts)

**Como** vendedor  
**Quero** editar informações de um negócio  
**Para** mantê-lo atualizado

**Critérios de Aceitação:**

- [ ] Botão "Editar" no card do negócio
- [ ] Abrir modal com formulário preenchido
- [ ] Campos editáveis: título, valor, data esperada, estágio
- [ ] Salvar atualiza o card visualmente
- [ ] Toast de sucesso

**Tarefas Técnicas:**

- [ ] Reutilizar `DealForm.tsx` (modo edit)
- [ ] API PATCH `/api/deals/[id]`
- [ ] Update SQL
- [ ] Testes: API PATCH

---

#### US-041: Mover Negócio entre Estágios - Drag and Drop (8 pts)

**Como** vendedor  
**Quero** arrastar negócios entre colunas  
**Para** atualizar o estágio rapidamente

**Critérios de Aceitação:**

- [ ] Arrastar card de uma coluna para outra
- [ ] Durante drag: card fica semi-transparente
- [ ] Durante drag over: coluna destino muda de cor
- [ ] Ao soltar: atualiza no banco (API call)
- [ ] Optimistic update: card move antes da resposta da API
- [ ] Se API falhar: card volta para coluna original + toast de erro
- [ ] Drag funciona em desktop (não implementar touch em mobile nesta sprint)

**Tarefas Técnicas:**

- [ ] Instalar e configurar `@hello-pangea/dnd`
- [ ] Envolver pipeline em `<DragDropContext>`
- [ ] `<Droppable droppableId={stage.id}>` para colunas
- [ ] `<Draggable draggableId={deal.id}>` para cards
- [ ] Implementar `onDragEnd` handler
- [ ] API PATCH `/api/deals/[id]` (atualizar stage_id e position)
- [ ] Optimistic UI com Zustand store
- [ ] Testes: simulação de drag (mock @hello-pangea/dnd)

---

#### US-042: Visualizar Detalhes do Negócio (3 pts)

**Como** vendedor  
**Quero** ver todos os detalhes de um negócio  
**Para** ter informações completas

**Critérios de Aceitação:**

- [ ] Clicar no card abre modal de detalhes
- [ ] Exibe: título, valor, contato (com link), estágio, status, datas
- [ ] Exibe histórico de mudanças de estágio (se houver tempo)
- [ ] Botão "Editar" no modal
- [ ] Botão "Fechar"

**Tarefas Técnicas:**

- [ ] Criar componente `DealDetailsModal.tsx`
- [ ] API GET `/api/deals/[id]`
- [ ] Query SQL com joins (contact, stage, user)
- [ ] Testes: DealDetailsModal

---

#### US-043: Associar Negócio a Contato (3 pts)

**Como** vendedor  
**Quero** vincular um negócio a um contato  
**Para** rastrear negócios por cliente

**Critérios de Aceitação:**

- [ ] Campo "Contato" obrigatório no formulário de criação
- [ ] Autocomplete com busca por nome/email
- [ ] Exibir nome do contato no card
- [ ] Clicar no nome abre detalhes do contato (link)

**Tarefas Técnicas:**

- [ ] Campo `contact_id` obrigatório no schema Zod
- [ ] Componente `ContactAutocomplete.tsx`
- [ ] API GET `/api/contacts?search={query}` (já existe)
- [ ] Foreign key no banco (já existe)
- [ ] Testes: validação obrigatoriedade

---

#### US-044: Definir Valor do Negócio (2 pts)

**Como** vendedor  
**Quero** definir o valor monetário do negócio  
**Para** calcular receita prevista

**Critérios de Aceitação:**

- [ ] Campo "Valor" no formulário (tipo number)
- [ ] Validação: valor >= 0
- [ ] Exibir valor formatado no card (R$ 1.234,56)
- [ ] Soma total dos valores por coluna

**Tarefas Técnicas:**

- [ ] Campo `value` (decimal) no schema
- [ ] Validação Zod: `z.number().min(0)`
- [ ] Função `formatCurrency(value)` em `src/lib/format.ts` (já existe)
- [ ] Calcular soma por coluna no frontend
- [ ] Testes: validação valor negativo

---

#### US-045: Marcar Negócio como Ganho/Perdido (3 pts)

**Como** vendedor  
**Quero** marcar um negócio como ganho ou perdido  
**Para** fechar o ciclo de vendas

**Critérios de Aceitação:**

- [ ] Botão "Ganho" no card (verde)
- [ ] Botão "Perdido" no card (vermelho)
- [ ] Ao marcar ganho: status = 'won', closed_at = now()
- [ ] Ao marcar perdido: status = 'lost', closed_at = now()
- [ ] Negócios fechados ficam visualmente diferentes (opacidade 50%)
- [ ] Não é possível mover negócios fechados

**Tarefas Técnicas:**

- [ ] API PATCH `/api/deals/[id]/close` (status: 'won' | 'lost')
- [ ] Update SQL: status + closed_at
- [ ] Desabilitar drag se status !== 'active'
- [ ] Badge com ícone ✓ (ganho) ou ✗ (perdido)
- [ ] Testes: API close, validação drag desabilitado

---

## 🏗️ Arquitetura Técnica

### Frontend

```
/dashboard/deals/
├── pipeline/
│   └── page.tsx              # Página principal do Kanban
└── [id]/
    ├── page.tsx              # Detalhes do negócio
    └── edit/
        └── page.tsx          # Editar negócio

/components/deals/
├── pipeline-board.tsx        # Container do Kanban (DragDropContext)
├── pipeline-column.tsx       # Coluna (Droppable)
├── deal-card.tsx             # Card do negócio (Draggable)
├── deal-form.tsx             # Formulário create/edit
├── deal-details-modal.tsx    # Modal de detalhes
├── contact-autocomplete.tsx  # Autocomplete de contatos
└── __tests__/
    ├── pipeline-board.test.tsx
    ├── deal-card.test.tsx
    └── deal-form.test.tsx
```

### Backend (API Routes)

```
/api/deals/
├── route.ts                  # GET (list), POST (create)
├── [id]/
│   ├── route.ts              # GET (details), PATCH (update), DELETE
│   └── close/
│       └── route.ts          # PATCH (marcar ganho/perdido)
└── __tests__/
    └── route.test.ts
```

### Validação (Zod)

```typescript
// src/lib/validations/deal.ts

export const dealSchema = z.object({
  title: z.string().min(1, 'Título é obrigatório'),
  contact_id: z.string().uuid('Contato é obrigatório'),
  stage_id: z.string().uuid('Estágio é obrigatório'),
  value: z.number().min(0, 'Valor deve ser positivo').default(0),
  expected_close_date: z.string().optional(),
  assigned_to: z.string().uuid().optional(),
});

export const updateDealSchema = dealSchema.partial();

export const closeDealSchema = z.object({
  status: z.enum(['won', 'lost']),
});
```

### State Management (Zustand)

```typescript
// src/store/deals-store.ts

interface DealsState {
  deals: DealWithDetails[];
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchDeals: () => Promise<void>;
  moveDeal: (dealId: string, newStageId: string, newPosition: number) => void;
  createDeal: (deal: CreateDealInput) => Promise<void>;
  updateDeal: (id: string, data: UpdateDealInput) => Promise<void>;
  closeDeal: (id: string, status: 'won' | 'lost') => Promise<void>;
}
```

---

## 📊 Métricas de Sucesso

### Coverage de Testes

- **Meta:** 35-45%
- **Componentes:** 80%+ (PipelineBoard, DealCard, DealForm)
- **API Routes:** 70%+ (GET, POST, PATCH, DELETE)
- **Validações:** 100% (Zod schemas)

### Performance

- **Carregar pipeline:** < 500ms
- **Drag and drop:** 60 FPS
- **Optimistic update:** < 50ms (visual)
- **API update:** < 300ms

### User Experience

- [ ] Drag suave e intuitivo
- [ ] Feedback visual claro
- [ ] Loading states em todas as ações
- [ ] Error states com mensagens amigáveis
- [ ] Responsivo em desktop (mobile será Sprint 5)

---

## 🔧 Tecnologias Utilizadas

### Core

- **Next.js 14** - App Router, Server Components
- **TypeScript** - Strict mode
- **React Hook Form** - Formulários
- **Zod** - Validação

### Drag and Drop

- **@hello-pangea/dnd** - Fork atualizado do react-beautiful-dnd
- Suporta: múltiplas listas, animações, acessibilidade

### State Management

- **Zustand** - Store global para deals
- Optimistic updates
- Sync com API

### UI Components

- **shadcn/ui** - Button, Modal, Form, Badge
- **Tailwind CSS** - Estilização
- **Lucide React** - Ícones

### Formatação

- `formatCurrency()` - R$ 1.234,56
- `formatDate()` - dd/MM/yyyy

---

## 🧪 Estratégia de Testes

### Unitários (Jest + React Testing Library)

```typescript
// Componentes
- PipelineBoard: renderiza colunas e cards
- PipelineColumn: calcula total de valor
- DealCard: exibe informações corretas
- DealForm: validação de campos

// API Routes
- GET /api/deals: retorna lista paginada
- POST /api/deals: cria com validação
- PATCH /api/deals/[id]: atualiza campos
- PATCH /api/deals/[id]/close: fecha com status

// Validações
- dealSchema: valida campos obrigatórios
- closeDealSchema: apenas 'won' ou 'lost'
```

### E2E (Playwright) - Básico

```typescript
test('Criar negócio e mover no pipeline', async ({ page }) => {
  // 1. Login
  // 2. Navegar para /dashboard/deals/pipeline
  // 3. Clicar "Novo Negócio"
  // 4. Preencher formulário
  // 5. Submeter
  // 6. Verificar card na coluna correta
  // 7. Arrastar para próxima coluna
  // 8. Verificar mudança de estágio
});
```

---

## 📅 Cronograma

### Semana 1 (12/12 - 18/12)

**Dia 1-2 (12-13/12):**

- [ ] Setup @hello-pangea/dnd
- [ ] Criar estrutura de pastas
- [ ] Implementar US-038 (Visualizar Kanban)
- [ ] Criar componentes básicos (Board, Column, Card)

**Dia 3-4 (14-15/12):**

- [ ] Implementar US-039 (Criar Negócio)
- [ ] Implementar US-043 (Associar a Contato)
- [ ] Implementar US-044 (Definir Valor)
- [ ] API POST `/api/deals`

**Dia 5 (16/12):**

- [ ] Implementar US-040 (Editar Negócio)
- [ ] API PATCH `/api/deals/[id]`
- [ ] Testes unitários (componentes + API)

### Semana 2 (19/12 - 25/12)

**Dia 6-7 (19-20/12):**

- [ ] Implementar US-041 (Drag and Drop)
- [ ] Optimistic updates com Zustand
- [ ] Testes de drag (mock library)

**Dia 8 (21/12):**

- [ ] Implementar US-042 (Detalhes do Negócio)
- [ ] Implementar US-045 (Ganho/Perdido)
- [ ] API PATCH `/api/deals/[id]/close`

**Dia 9-10 (22-23/12):**

- [ ] Polimento de UI/UX
- [ ] Testes E2E (Playwright)
- [ ] Code review
- [ ] Documentação

**Dia 11 (24/12):**

- [ ] Sprint Review
- [ ] Sprint Retrospective
- [ ] Deploy em staging

---

## ✅ Definition of Done

Checklist para considerar a Sprint completa:

### Funcional

- [ ] Todas as 8 User Stories implementadas
- [ ] Kanban funciona perfeitamente (drag and drop)
- [ ] Criar, editar, visualizar e fechar negócios
- [ ] Associação com contatos funcionando
- [ ] Valores formatados corretamente

### Técnico

- [ ] Zero erros TypeScript
- [ ] Zero erros ESLint
- [ ] Build passa sem warnings
- [ ] Coverage de testes ≥ 35%

### Testes

- [ ] 15+ testes unitários (componentes)
- [ ] 8+ testes de API
- [ ] 5+ testes de validação
- [ ] 1+ teste E2E (fluxo completo)

### Performance

- [ ] Lighthouse score ≥ 90
- [ ] Drag and drop 60 FPS
- [ ] Carregar pipeline < 500ms

### Segurança

- [ ] RLS habilitado nas tabelas `deals`
- [ ] Validação server-side em todas APIs
- [ ] Autenticação obrigatória

### Documentação

- [ ] README atualizado
- [ ] Componentes documentados (JSDoc)
- [ ] APIs documentadas (comentários)
- [ ] Este documento atualizado com conclusões

---

## 🚧 Riscos e Mitigações

| Risco                            | Probabilidade | Impacto | Mitigação                                                                 |
| -------------------------------- | ------------- | ------- | ------------------------------------------------------------------------- |
| Complexidade do drag-and-drop    | Alta          | Alto    | Usar biblioteca testada (@hello-pangea/dnd), não reinventar               |
| Performance com muitos cards     | Média         | Médio   | Virtualização (react-window) apenas se necessário                         |
| Optimistic UI com falhas de rede | Média         | Médio   | Rollback automático + toast de erro                                       |
| Tempo insuficiente               | Baixa         | Alto    | Priorizar US-038 e US-041 (core), deixar US-042 para depois se necessário |

---

## 📚 Referências Técnicas

### Drag and Drop

- [@hello-pangea/dnd Docs](https://github.com/hello-pangea/dnd)
- [Drag and Drop Best Practices](https://developer.mozilla.org/en-US/docs/Web/API/HTML_Drag_and_Drop_API)

### Design Patterns

- Optimistic UI: [React Query Docs](https://tanstack.com/query/latest/docs/react/guides/optimistic-updates)
- Zustand Store: [Zustand Docs](https://docs.pmnd.rs/zustand/getting-started/introduction)

### Inspirações de UI

- Linear (pipeline simples e rápido)
- Trello (clássico Kanban)
- Pipedrive (CRM com pipeline visual)

---

## 🎉 Valor Entregue

Ao final desta Sprint, o usuário poderá:

1. ✅ **Visualizar** todos os negócios em um pipeline visual e organizado
2. ✅ **Criar** novos negócios vinculados a contatos
3. ✅ **Editar** informações de negócios existentes
4. ✅ **Mover** negócios entre estágios com drag-and-drop intuitivo
5. ✅ **Definir** valores monetários e calcular receita por estágio
6. ✅ **Fechar** negócios marcando como ganhos ou perdidos
7. ✅ **Ter visão clara** do pipeline de vendas e priorizar ações

**Resultado:** Sistema CRM com funcionalidade profissional de gestão de negócios! 🚀
