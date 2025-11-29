# 🚀 Sprint 4 - Kickoff

**Data de Início:** 29/11/2024  
**Data Atual:** 29/11/2024  
**Branch:** `sprint-4/pipeline-vendas-kanban`  
**Duração:** 2 semanas (29/11 - 25/12)  
**Story Points:** 30 pts (5 completos / 25 pendentes)  
**Status:** 🟢 **EM ANDAMENTO** (16.7% completo)  
**Velocidade:** 5 pts/dia (meta: 2.5 pts/dia) 🚀

---

## 🎯 Objetivo da Sprint

Implementar **Pipeline Visual de Vendas** (Kanban drag-and-drop) com otimizações de performance críticas.

### Epics

1. **Pipeline de Vendas (22 pts)** - CORE  
   - Sistema completo de gestão de negócios
   - Visualização Kanban intuitiva
   - Drag-and-drop suave e rápido

2. **Performance Crítica (8 pts)** - ESSENCIAL  
   - Code splitting onde impacta
   - Database indexes críticos
   - Monitoramento básico

---

## 📊 User Stories

### Epic 1: Pipeline de Vendas (22 pts)

| ID | Story | Pontos | Status | Prioridade |
|----|-------|--------|--------|------------|
| US-038 | Visualizar Kanban de Negócios | 5 | ✅ **COMPLETO** | 🔴 Crítica |
| US-039 | Criar Novo Negócio | 3 | ⏳ **PRÓXIMA** | 🔴 Crítica |
| US-040 | Editar Negócio | 3 | ⬜ Pendente | 🟡 Alta |
| US-041 | Drag and Drop entre Estágios | 8 | ⬜ Pendente | 🔴 Crítica |
| US-042 | Visualizar Detalhes do Negócio | 3 | ⬜ Pendente | 🟡 Alta |

### Epic 2: Performance Crítica (8 pts)

| ID | Story | Pontos | Status | Prioridade |
|----|-------|--------|--------|------------|
| US-043 | Code Splitting Essencial | 3 | ⬜ Pendente | 🟡 Alta |
| US-044 | Database Indexes | 3 | ⬜ Pendente | 🟡 Alta |
| US-045 | Monitoramento Básico | 2 | ⬜ Pendente | 🟢 Média |

---

## 🏗️ Arquitetura Técnica

### Stack Principal

```
Frontend:
- Next.js 14 (App Router)
- React Hook Form + Zod
- @hello-pangea/dnd (drag-and-drop)
- shadcn/ui + Tailwind CSS

Backend:
- Next.js API Routes
- Supabase (PostgreSQL)
- RLS (Row Level Security)

State:
- useState (KISS approach)
- SWR para cache simples
```

### Estrutura de Pastas

```
src/
├── app/
│   ├── (dashboard)/
│   │   └── dashboard/deals/
│   │       └── pipeline/page.tsx       # Página principal Kanban
│   └── api/deals/
│       ├── route.ts                    # GET (list), POST (create)
│       └── [id]/
│           ├── route.ts                # GET, PATCH, DELETE
│           └── close/route.ts          # PATCH (ganho/perdido)
├── components/deals/
│   ├── pipeline-board.tsx              # Container DnD
│   ├── pipeline-column.tsx             # Coluna (estágio)
│   ├── deal-card.tsx                   # Card do negócio
│   ├── deal-form.tsx                   # Formulário create/edit
│   ├── deal-details-modal.tsx          # Modal detalhes
│   ├── contact-autocomplete.tsx        # Autocomplete contatos
│   └── __tests__/
├── lib/validations/
│   └── deal.ts                         # Zod schemas
└── types/
    └── deal.ts                         # TypeScript types
```

---

## 📅 Cronograma (2 semanas)

### Semana 1: Core Features (12-16/12)

**Dia 1 (29/11) - Sexta** ✅ **COMPLETO**
- [x] Setup @hello-pangea/dnd
- [x] Estrutura de pastas e arquivos
- [x] US-038: Visualizar Kanban (100% - 5pts)
  - [x] Criar página /dashboard/deals/pipeline
  - [x] Componentes: PipelineBoard, PipelineColumn, DealCard
  - [x] API GET /api/deals (lista + pipeline view)
  - [x] API POST /api/deals (criar)
  - [x] Skeleton loaders (PipelineSkeleton)
  - [x] Empty states melhorados
  - [x] Responsividade mobile-first
  - [x] Hover states e transições
  - [x] Acessibilidade (ARIA)
  - [x] 13 testes (100% passando)

**Próximo: US-039 - Criar Negócio (3 pts)**

**Dia 3 (14/12) - Quinta**
- [ ] US-039: Criar Negócio
  - [ ] DealForm component (mode: create)
  - [ ] Validação Zod (dealSchema)
  - [ ] ContactAutocomplete
  - [ ] API POST /api/deals
- [ ] Testes: Validação + API POST (4 testes)

**Dia 4 (15/12) - Sexta**
- [ ] US-040: Editar Negócio
  - [ ] DealForm (mode: edit - reutilizar)
  - [ ] Modal de edição
  - [ ] API PATCH /api/deals/[id]
- [ ] Testes: API PATCH (3 testes)

**Dia 5 (16/12) - Sábado**
- [ ] US-042: Detalhes do Negócio
  - [ ] DealDetailsModal component
  - [ ] API GET /api/deals/[id] (detalhes)
- [ ] Polimento de UI
- [ ] Testes: Modal + API GET (2 testes)

### Semana 2: Drag-and-Drop + Performance (19-24/12)

**Dia 6-7 (19-20/12) - Qui-Sex**
- [ ] US-041: Drag and Drop (COMPLEXO - 2 dias)
  - [ ] Integração @hello-pangea/dnd
  - [ ] DragDropContext + Droppable + Draggable
  - [ ] handleDragEnd logic
  - [ ] Optimistic updates (useState)
  - [ ] Rollback em caso de erro
  - [ ] Desabilitar drag se status !== 'active'
- [ ] Testes: Drag logic (mock library - 4 testes)

**Dia 8 (21/12) - Sábado**
- [ ] US-043: Code Splitting
  - [ ] Dynamic imports (PipelineBoard, Relatórios)
  - [ ] Skeleton loaders
  - [ ] Otimizar next.config.js
- [ ] US-044: Database Indexes
  - [ ] Migration: add_critical_indexes.sql
  - [ ] Índices: deals, contacts, tasks

**Dia 9 (22/12) - Domingo**
- [ ] US-045: Monitoramento Básico
  - [ ] Vercel Analytics + SpeedInsights
  - [ ] Lighthouse CI (GitHub Actions)
- [ ] Testes E2E (Playwright - 1 teste básico)
- [ ] Code review interno

**Dia 10 (23/12) - Segunda**
- [ ] Ajustes finais
- [ ] Documentação completa
- [ ] Deploy staging
- [ ] Validação final

**Dia 11 (24/12) - Terça**
- [ ] Sprint Review
- [ ] Sprint Retrospective
- [ ] Merge para main

---

## 🧪 Estratégia de Testes

### Meta de Coverage
**35-45%** (pragmático, não buscar 80%+)

### Testes Planejados

**Unitários (18 testes)**
- PipelineBoard: 3 testes
- DealCard: incluído no board
- DealForm: 4 testes (validação)
- API POST: 2 testes
- API PATCH: 2 testes
- API GET: 1 teste
- Drag logic: 4 testes (mock library)
- Validação Zod: 2 testes

**E2E (1 teste)**
- Fluxo completo: Criar → Visualizar → Mover → Editar → Fechar

---

## 🎯 Definition of Done

### Funcional
- [ ] 8 User Stories implementadas
- [ ] Pipeline visual funcionando
- [ ] Drag-and-drop suave (60 FPS)
- [ ] CRUD completo de negócios

### Técnico
- [ ] Zero erros TypeScript/ESLint
- [ ] Build passa sem warnings
- [ ] 18+ testes unitários
- [ ] 1 teste E2E
- [ ] Coverage 35-45%

### Performance
- [ ] Lighthouse Performance > 85
- [ ] First Load JS < 200 KB
- [ ] Database queries < 100ms (indexed)
- [ ] GET /api/deals < 300ms

### Segurança
- [ ] RLS habilitado na tabela `deals`
- [ ] Validação server-side em todas APIs
- [ ] Autenticação obrigatória

### UX
- [ ] Loading states em todas ações
- [ ] Skeleton loaders nas páginas
- [ ] Toast feedback (sucesso/erro)
- [ ] Optimistic updates no drag

### Documentação
- [ ] README atualizado
- [ ] Componentes documentados (JSDoc)
- [ ] APIs documentadas
- [ ] Este documento atualizado com conclusões

---

## 🚧 Riscos e Mitigações

| Risco | Prob. | Impacto | Mitigação |
|-------|-------|---------|-----------|
| Complexidade drag-and-drop | 🔴 Alta | 🔴 Alto | Usar biblioteca testada (@hello-pangea/dnd) |
| Performance com 100+ cards | 🟡 Média | 🟡 Médio | Limite 100 por query (suficiente) |
| Optimistic UI bugs | 🟡 Média | 🟡 Médio | Rollback automático + toast erro |
| Tempo insuficiente | 🟢 Baixa | 🔴 Alto | Priorizar US-038 e US-041 (core) |

---

## 📚 Recursos e Referências

### Bibliotecas Principais
- [@hello-pangea/dnd](https://github.com/hello-pangea/dnd) - Drag and drop
- [React Hook Form](https://react-hook-form.com/) - Formulários
- [Zod](https://zod.dev/) - Validação
- [SWR](https://swr.vercel.app/) - Cache simples

### Inspirações de Design
- Linear: Pipeline simples e rápido
- Trello: Kanban clássico
- Pipedrive: CRM profissional

### Documentação Técnica
- [Next.js Performance](https://nextjs.org/docs/app/building-your-application/optimizing)
- [Supabase Performance](https://supabase.com/docs/guides/platform/performance)
- [Vercel Analytics](https://vercel.com/docs/analytics)

---

## ✅ Checklist de Inicialização

- [x] Branch criada: `sprint-4/pipeline-vendas-kanban`
- [x] Documento de planejamento consolidado
- [x] Documento de kickoff criado
- [ ] Dependencies instaladas (`@hello-pangea/dnd`)
- [ ] Estrutura de pastas criada
- [ ] Primeira US (US-038) iniciada

---

## 📊 Métricas de Acompanhamento

### Story Points por Semana
- **Semana 1:** 14 pts (US-038, US-039, US-040, US-042)
- **Semana 2:** 16 pts (US-041, US-043, US-044, US-045)

### Velocity Esperada
**15 pts/semana** (baseado em Sprint 3: 12 pts/dia)

### Daily Tracking
- **Todos os dias:** Atualizar este documento com progresso
- **Bloqueios:** Documentar imediatamente
- **Conclusões:** Marcar ✅ ao finalizar

---

## 🎉 Valor Esperado

Ao final desta Sprint, o usuário poderá:

1. ✅ **Visualizar** pipeline de vendas organizado por estágios
2. ✅ **Criar** novos negócios vinculados a contatos
3. ✅ **Editar** informações de negócios existentes
4. ✅ **Mover** negócios entre estágios com drag-and-drop intuitivo
5. ✅ **Visualizar** detalhes completos de cada negócio
6. ✅ **Experiência rápida** com código otimizado onde importa

**Resultado Final:** CRM profissional com gestão visual de pipeline! 🚀

---

**Criado em:** 29/11/2024  
**Última atualização:** 29/11/2024  
**Status:** 🚀 **SPRINT INICIADA!**
