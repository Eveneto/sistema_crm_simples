# 📋 Sprint 2 Planning - Dashboard + Contatos

**Data de Início:** 27 de novembro de 2025  
**Data de Término:** 10 de dezembro de 2025  
**Duração:** 2 semanas (10 dias úteis)  
**Capacity:** 32 Story Points

---

## 🎯 Sprint Goal

> **"Entregar dashboard funcional com métricas em tempo real e módulo completo de gestão de contatos (CRUD + busca + tags), permitindo aos usuários visualizar performance e organizar sua base de clientes."**

---

## 📊 Sprint Backlog

### User Stories Selecionadas

#### Epic 2: Dashboard e Visualização

##### US-008: Dashboard Principal (8 pts) 🔴 HIGH

**Como** usuário autenticado  
**Quero** visualizar um dashboard com visão geral do negócio  
**Para** tomar decisões rápidas baseadas em dados

**Critérios de Aceitação:**

- [ ] Dashboard renderiza com layout responsivo
- [ ] Mostra cards de KPIs principais (vendas, conversas, conversão)
- [ ] Atualiza dados automaticamente
- [ ] Loading states durante fetch
- [ ] Error handling se API falhar
- [ ] Filtro por período (7 dias, 30 dias, 90 dias)

**Tarefas Técnicas:**

- [ ] Criar página `/dashboard` (já existe, expandir)
- [ ] Criar componente `DashboardGrid`
- [ ] Implementar API `GET /api/dashboard/overview`
- [ ] Conectar com Supabase para métricas
- [ ] Implementar filtros de período
- [ ] Testes unitários (8 testes)

**Estimativa:** 1.5 dias

---

##### US-009: Cards de KPIs (5 pts) 🔴 HIGH

**Como** usuário  
**Quero** ver indicadores chave de performance em cards visuais  
**Para** monitorar métricas importantes rapidamente

**Critérios de Aceitação:**

- [ ] Card de Total de Vendas (valor, crescimento %)
- [ ] Card de Conversas Ativas (quantidade, pendentes)
- [ ] Card de Taxa de Conversão (percentual)
- [ ] Card de Novos Contatos (quantidade, período)
- [ ] Cada card mostra comparação com período anterior
- [ ] Ícones e cores apropriadas por métrica
- [ ] Skeleton loading durante fetch

**Tarefas Técnicas:**

- [ ] Criar componente `KPICard` reutilizável
- [ ] Criar componente `TrendIndicator`
- [ ] Implementar cálculo de crescimento percentual
- [ ] Formatar valores monetários (BRL)
- [ ] Testes unitários (6 testes)

**Estimativa:** 1 dia

---

##### US-010: Gráfico de Vendas (5 pts) 🟡 MEDIUM

**Como** usuário  
**Quero** visualizar gráfico de vendas por período  
**Para** identificar tendências e padrões

**Critérios de Aceitação:**

- [ ] Gráfico de linha mostrando vendas ao longo do tempo
- [ ] Eixo X: datas, Eixo Y: valor em R$
- [ ] Tooltip com detalhes ao passar mouse
- [ ] Responsivo (adapta a tela mobile)
- [ ] Filtro por período (diário, semanal, mensal)
- [ ] Loading state durante fetch
- [ ] Mensagem quando não há dados

**Tarefas Técnicas:**

- [ ] Instalar e configurar Recharts
- [ ] Criar componente `SalesChart`
- [ ] Implementar API `GET /api/dashboard/sales`
- [ ] Agregar dados por período
- [ ] Formatar tooltips
- [ ] Testes unitários (4 testes)

**Estimativa:** 1 dia

---

#### Epic 3: Gestão de Contatos

##### US-017: Listar Contatos (3 pts) 🔴 HIGH

**Como** usuário  
**Quero** ver lista de todos os meus contatos  
**Para** ter visão geral da base de clientes

**Critérios de Aceitação:**

- [ ] Página `/contacts` com lista de contatos
- [ ] Mostra nome, email, telefone, tags
- [ ] Paginação (20 por página)
- [ ] Ordenação (nome, criado em)
- [ ] Loading skeleton durante fetch
- [ ] Empty state quando não há contatos
- [ ] Link para criar novo contato

**Tarefas Técnicas:**

- [ ] Criar página `app/dashboard/contacts/page.tsx`
- [ ] Criar componente `ContactsList`
- [ ] Criar componente `ContactCard`
- [ ] Implementar API `GET /api/contacts`
- [ ] Implementar paginação no Supabase
- [ ] Testes unitários (5 testes)

**Estimativa:** 0.5 dia

---

##### US-018: Criar Novo Contato (3 pts) 🔴 HIGH

**Como** usuário  
**Quero** adicionar um novo contato  
**Para** expandir minha base de clientes

**Critérios de Aceitação:**

- [ ] Modal/página de criação de contato
- [ ] Campos: nome*, email, telefone*, empresa, cargo, tags
- [ ] Validação de email (formato)
- [ ] Validação de telefone (formato brasileiro)
- [ ] Não permitir duplicatas (mesmo email/telefone)
- [ ] Toast de sucesso após criar
- [ ] Redirect para lista após criar
- [ ] Botão de cancelar

**Tarefas Técnicas:**

- [ ] Criar componente `ContactForm`
- [ ] Implementar validação com Zod
- [ ] Implementar API `POST /api/contacts`
- [ ] Adicionar verificação de duplicatas
- [ ] Inserir no Supabase com RLS
- [ ] Testes unitários (7 testes)

**Estimativa:** 0.5 dia

---

##### US-019: Editar Contato (3 pts) 🟡 MEDIUM

**Como** usuário  
**Quero** editar informações de um contato  
**Para** manter dados atualizados

**Critérios de Aceitação:**

- [ ] Modal/página de edição
- [ ] Campos preenchidos com dados atuais
- [ ] Mesmas validações da criação
- [ ] Toast de sucesso após salvar
- [ ] Não permitir salvar sem mudanças
- [ ] Botão de cancelar

**Tarefas Técnicas:**

- [ ] Reutilizar `ContactForm` com modo edit
- [ ] Implementar API `PATCH /api/contacts/[id]`
- [ ] Carregar dados existentes
- [ ] Atualizar no Supabase com RLS
- [ ] Testes unitários (6 testes)

**Estimativa:** 0.5 dia

---

##### US-020: Visualizar Detalhes do Contato (2 pts) 🟡 MEDIUM

**Como** usuário  
**Quero** ver todos os detalhes de um contato  
**Para** ter informações completas

**Critérios de Aceitação:**

- [ ] Página de detalhes `/contacts/[id]`
- [ ] Mostra todos os campos do contato
- [ ] Mostra histórico de interações (futuro)
- [ ] Mostra negócios relacionados (futuro)
- [ ] Botão de editar
- [ ] Botão de excluir (com confirmação)
- [ ] Breadcrumb de navegação

**Tarefas Técnicas:**

- [ ] Criar página `app/dashboard/contacts/[id]/page.tsx`
- [ ] Criar componente `ContactDetails`
- [ ] Implementar API `GET /api/contacts/[id]`
- [ ] Buscar dados no Supabase
- [ ] Testes unitários (4 testes)

**Estimativa:** 0.5 dia

---

##### US-021: Buscar Contatos (3 pts) 🟡 MEDIUM

**Como** usuário  
**Quero** buscar contatos por nome, email ou telefone  
**Para** encontrar rapidamente quem procuro

**Critérios de Aceitação:**

- [ ] Campo de busca no topo da lista
- [ ] Busca em tempo real (debounce 300ms)
- [ ] Busca por nome, email, telefone, empresa
- [ ] Mostra resultados filtrados
- [ ] Loading durante busca
- [ ] Mensagem quando não encontra nada
- [ ] Limpar busca volta lista completa

**Tarefas Técnicas:**

- [ ] Criar componente `ContactSearch`
- [ ] Implementar debounce hook
- [ ] Adicionar query params à API `GET /api/contacts?search=`
- [ ] Implementar full-text search no Supabase
- [ ] Testes unitários (5 testes)

**Estimativa:** 0.5 dia

---

##### US-022: Tags em Contatos (3 pts) 🟢 LOW

**Como** usuário  
**Quero** adicionar tags aos contatos  
**Para** organizá-los em categorias

**Critérios de Aceitação:**

- [ ] Campo de tags no formulário de contato
- [ ] Criar novas tags ou selecionar existentes
- [ ] Múltiplas tags por contato
- [ ] Visualização de tags coloridas
- [ ] Filtrar contatos por tag
- [ ] Autocomplete de tags existentes

**Tarefas Técnicas:**

- [ ] Criar tabela `contact_tags` no Supabase
- [ ] Criar componente `TagInput`
- [ ] Implementar API de tags
- [ ] Adicionar filtro por tag
- [ ] Testes unitários (4 testes)

**Estimativa:** 0.5 dia

---

## 📈 Resumo do Sprint Backlog

| ID        | User Story          | Story Points | Prioridade | Estimativa |
| --------- | ------------------- | ------------ | ---------- | ---------- |
| US-008    | Dashboard Principal | 8            | 🔴 HIGH    | 1.5 dias   |
| US-009    | Cards de KPIs       | 5            | 🔴 HIGH    | 1 dia      |
| US-010    | Gráfico de Vendas   | 5            | 🟡 MEDIUM  | 1 dia      |
| US-017    | Listar Contatos     | 3            | 🔴 HIGH    | 0.5 dia    |
| US-018    | Criar Contato       | 3            | 🔴 HIGH    | 0.5 dia    |
| US-019    | Editar Contato      | 3            | 🟡 MEDIUM  | 0.5 dia    |
| US-020    | Detalhes Contato    | 2            | 🟡 MEDIUM  | 0.5 dia    |
| US-021    | Buscar Contatos     | 3            | 🟡 MEDIUM  | 0.5 dia    |
| US-022    | Tags em Contatos    | 3            | 🟢 LOW     | 0.5 dia    |
| **TOTAL** | **9 User Stories**  | **35 pts**   | -          | **7 dias** |

**Capacity:** 32 pts (planejado)  
**Committed:** 35 pts (leve stretch goal)  
**Buffer:** 3 dias para testes, CI/CD, e imprevistos

---

## 🏗️ Arquitetura Técnica

### Estrutura de Pastas

```
src/
├── app/
│   └── dashboard/
│       ├── page.tsx (Dashboard - expandir)
│       └── contacts/
│           ├── page.tsx (Lista de contatos)
│           ├── new/
│           │   └── page.tsx (Criar contato)
│           └── [id]/
│               ├── page.tsx (Detalhes)
│               └── edit/
│                   └── page.tsx (Editar)
├── components/
│   ├── dashboard/
│   │   ├── dashboard-grid.tsx
│   │   ├── kpi-card.tsx
│   │   ├── trend-indicator.tsx
│   │   └── sales-chart.tsx
│   └── contacts/
│       ├── contacts-list.tsx
│       ├── contact-card.tsx
│       ├── contact-form.tsx
│       ├── contact-details.tsx
│       ├── contact-search.tsx
│       └── tag-input.tsx
├── lib/
│   ├── api/
│   │   ├── dashboard.ts
│   │   └── contacts.ts
│   └── validations/
│       └── contact.schema.ts
└── hooks/
    ├── use-contacts.ts
    ├── use-dashboard.ts
    └── use-debounce.ts
```

### API Endpoints

```typescript
// Dashboard
GET  /api/dashboard/overview?period=7d|30d|90d
GET  /api/dashboard/sales?period=daily|weekly|monthly

// Contacts
GET    /api/contacts?page=1&limit=20&search=query&tag=id
POST   /api/contacts
GET    /api/contacts/[id]
PATCH  /api/contacts/[id]
DELETE /api/contacts/[id]

// Tags
GET    /api/tags
POST   /api/tags
```

### Schema do Banco (Supabase)

```sql
-- Já existe: contacts table

-- Nova: contact_tags
CREATE TABLE contact_tags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(50) NOT NULL UNIQUE,
  color VARCHAR(7) NOT NULL DEFAULT '#3B82F6',
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Nova: contacts_tags_junction
CREATE TABLE contacts_tags_junction (
  contact_id UUID REFERENCES contacts(id) ON DELETE CASCADE,
  tag_id UUID REFERENCES contact_tags(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  PRIMARY KEY (contact_id, tag_id)
);

-- RLS Policies
ALTER TABLE contact_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts_tags_junction ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their tags"
  ON contact_tags FOR SELECT
  USING (created_by = auth.uid());

CREATE POLICY "Users can manage their tags"
  ON contact_tags FOR ALL
  USING (created_by = auth.uid());
```

---

## 🧪 Estratégia de Testes

### Coverage Target: 30-35%

#### 1. **Unit Tests (Jest + RTL)**

**Business Logic (90%+ coverage):**

- `lib/api/dashboard.ts` - cálculos de métricas
- `lib/api/contacts.ts` - CRUD logic
- `lib/validations/contact.schema.ts` - validações Zod
- `hooks/use-contacts.ts` - hook de contatos
- `hooks/use-dashboard.ts` - hook de dashboard

**Components (40%+ coverage):**

- `KPICard` - renderização e formatação
- `TrendIndicator` - cálculo de tendência
- `ContactForm` - validações
- `ContactSearch` - debounce e busca

**Estimativa:** 30-40 novos testes

#### 2. **Integration Tests (React Testing Library)**

**Fluxos críticos:**

- [ ] Criar contato completo (formulário → API → lista)
- [ ] Editar contato existente
- [ ] Buscar e filtrar contatos
- [ ] Adicionar tags a contato

**Estimativa:** 10-15 testes de integração

#### 3. **E2E Tests (Playwright - Inicial)**

**Setup básico + 2 fluxos críticos:**

- [ ] Login → Dashboard → Ver métricas
- [ ] Login → Criar contato → Ver na lista

**Estimativa:** Configuração (2h) + 2 testes (1h)

---

## ⚙️ Tarefas Técnicas Adicionais

### 1. **CI/CD** (Prioridade ALTA) - 3h

- [ ] Configurar GitHub Actions
- [ ] Workflow: lint → test → build
- [ ] Rodar testes em PRs
- [ ] Deploy automático em staging (Vercel)
- [ ] Notificações de falha

**Responsável:** Dev 1  
**Timeline:** Dia 1 da Sprint

### 2. **Recharts Integration** - 2h

- [ ] Instalar `recharts`
- [ ] Configurar theme (dark/light)
- [ ] Criar componentes base
- [ ] Documentar uso

**Responsável:** Dev 2  
**Timeline:** Dia 2 da Sprint

### 3. **API Layer Refactor** - 3h

- [ ] Criar `lib/api/client.ts` (fetch wrapper)
- [ ] Implementar error handling consistente
- [ ] Adicionar retry logic
- [ ] Adicionar request/response logging

**Responsável:** Dev 1  
**Timeline:** Dia 3 da Sprint

### 4. **Database Migrations** - 2h

- [ ] Migration: contact_tags table
- [ ] Migration: contacts_tags_junction
- [ ] Seed data: tags padrão (Lead, Cliente, Prospect, etc)
- [ ] RLS policies

**Responsável:** Dev 2  
**Timeline:** Dia 1 da Sprint

### 5. **Performance Optimization** - 2h

- [ ] Implementar React Query (cache)
- [ ] Lazy loading de componentes pesados
- [ ] Optimistic updates em contatos
- [ ] Debounce em buscas

**Responsável:** Dev 1  
**Timeline:** Dia 8 da Sprint

---

## 📅 Timeline Detalhado (2 Semanas)

### **Semana 1 (Dias 1-5)**

#### Dia 1 (Quarta) - Setup & Infraestrutura

- ✅ Sprint Planning (esta reunião)
- [ ] Configurar CI/CD (3h)
- [ ] Database migrations (2h)
- [ ] Iniciar US-008: Dashboard Principal (2h)

#### Dia 2 (Quinta) - Dashboard

- [ ] Continuar US-008: Dashboard (4h)
- [ ] Iniciar US-009: KPI Cards (2h)
- [ ] Recharts integration (2h)

#### Dia 3 (Sexta) - Dashboard + API

- [ ] Finalizar US-009: KPI Cards (2h)
- [ ] US-010: Gráfico de Vendas (4h)
- [ ] API Layer refactor (2h)

#### Dia 4 (Segunda) - Contatos CRUD

- [ ] US-017: Listar Contatos (4h)
- [ ] US-018: Criar Contato (4h)

#### Dia 5 (Terça) - Contatos CRUD

- [ ] US-019: Editar Contato (4h)
- [ ] US-020: Detalhes do Contato (4h)

### **Semana 2 (Dias 6-10)**

#### Dia 6 (Quarta) - Busca & Tags

- [ ] US-021: Buscar Contatos (4h)
- [ ] US-022: Tags em Contatos (4h)

#### Dia 7 (Quinta) - Testes & E2E Setup

- [ ] Escrever unit tests (6h)
- [ ] Setup Playwright (2h)

#### Dia 8 (Sexta) - Testes & Performance

- [ ] Testes de integração (4h)
- [ ] Performance optimization (2h)
- [ ] 2 testes E2E (2h)

#### Dia 9 (Segunda) - Refinamento & Bugs

- [ ] Code review e ajustes (4h)
- [ ] Bug fixes (4h)

#### Dia 10 (Terça) - Sprint Review & Deploy

- [ ] Testing final (3h)
- [ ] Sprint Review (2h)
- [ ] Deploy staging (1h)
- [ ] Sprint Retrospective (2h)

---

## ✅ Definition of Done (Sprint 2)

Uma User Story está completa quando:

- [ ] Código desenvolvido e commitado
- [ ] **Testes unitários:** ≥ 90% business logic, ≥ 40% components
- [ ] **Testes de integração:** fluxos críticos cobertos
- [ ] **2 testes E2E** (setup + críticos)
- [ ] **Coverage global:** ≥ 30% (manter ou aumentar para 35%)
- [ ] Todos os testes passando (`npm test`)
- [ ] **CI/CD:** Pipeline verde (lint + test + build)
- [ ] Code review aprovado (1+ aprovação)
- [ ] Build passa sem erros/warnings
- [ ] **Deploy em staging:** Funcionando em ambiente real
- [ ] Documentação atualizada
- [ ] PO aceitou a entrega
- [ ] Zero regressões em funcionalidades existentes

---

## 🎯 Métricas de Sucesso

| Métrica                     | Target Sprint 2 | Como Medir     |
| --------------------------- | --------------- | -------------- |
| **User Stories Completas**  | 8/9 (89%+)      | Burndown chart |
| **Story Points Entregues**  | 30+ (de 35)     | Velocity       |
| **Coverage Global**         | 30-35%          | Jest report    |
| **Coverage Business Logic** | 90%+            | Jest report    |
| **Tests Passing**           | 100%            | CI/CD          |
| **CI/CD Setup**             | ✅ Complete     | GitHub Actions |
| **E2E Tests**               | 2+              | Playwright     |
| **Bugs em Produção**        | 0               | Sentry         |
| **Performance (LCP)**       | < 2.5s          | Lighthouse     |
| **Deploy Staging**          | ✅ Success      | Vercel         |

---

## 🚧 Riscos e Mitigações

### Risco 1: Recharts Learning Curve 🟡 MÉDIO

**Probabilidade:** 60%  
**Impacto:** Atraso de 0.5-1 dia

**Mitigação:**

- Estudar docs Recharts no Dia 1
- Usar exemplos prontos da comunidade
- Fallback: gráfico simples com Canvas API

### Risco 2: Full-text Search Complexo 🟡 MÉDIO

**Probabilidade:** 40%  
**Impacto:** US-021 pode levar +2h

**Mitigação:**

- Usar `ilike` simples do Supabase primeiro
- Implementar `tsvector` só se necessário
- Fallback: busca client-side

### Risco 3: CI/CD Issues 🟢 BAIXO

**Probabilidade:** 30%  
**Impacto:** Atraso de 2-4h

**Mitigação:**

- Usar template GitHub Actions Next.js
- Testar localmente antes de push
- Pair programming na config

### Risco 4: Scope Creep 🔴 ALTO

**Probabilidade:** 70%  
**Impacto:** Não entregar todas US

**Mitigação:**

- **Priorização clara:** US-022 é LOW, pode ser movida para Sprint 3
- Daily Scrum rigoroso
- Não adicionar features não planejadas

---

## 📦 Dependencies & Blockers

### Dependencies

- ✅ Sprint 1 completa (auth + layout)
- ✅ Supabase configurado
- ✅ Tabela `contacts` existente
- [ ] Tabela `contact_tags` (criar no Dia 1)

### Potential Blockers

- ❌ Nenhum blocker identificado
- ✅ Time disponível full-time
- ✅ Ambiente de desenvolvimento pronto

---

## 🎉 Sprint Kick-off Checklist

### Antes de Iniciar (Hoje)

- [x] Sprint Planning concluído
- [x] User Stories clarificadas
- [x] Tarefas técnicas identificadas
- [ ] Sprint Goal acordado com PO
- [ ] Commits da Sprint 1 finalizados
- [ ] Branch `sprint-2` criada

### Dia 1 (Amanhã)

- [ ] Daily Scrum 9h30
- [ ] Criar issues no GitHub para cada US
- [ ] Configurar GitHub Projects (Kanban)
- [ ] Pair programming: CI/CD setup
- [ ] Database migrations rodadas

---

## 📚 Recursos e Referências

### Documentação

- [Recharts Docs](https://recharts.org/)
- [Supabase Full-Text Search](https://supabase.com/docs/guides/database/full-text-search)
- [React Query](https://tanstack.com/query/latest)
- [Playwright](https://playwright.dev/)

### Design References

- [Dashboard UI Inspiration](https://dribbble.com/tags/dashboard)
- [Contact Management](https://dribbble.com/tags/crm)

### Libraries to Install

```bash
npm install recharts
npm install @tanstack/react-query
npm install zod
npm install @playwright/test --save-dev
```

---

## 🏁 Critérios de Aceitação do Sprint Goal

O Sprint 2 será considerado **sucesso** se:

1. ✅ **Dashboard funcional** com métricas reais do banco
2. ✅ **CRUD completo de contatos** funcionando
3. ✅ **Busca de contatos** operacional
4. ✅ **CI/CD configurado** e pipeline verde
5. ✅ **30%+ coverage** mantido
6. ✅ **Deploy em staging** bem-sucedido
7. ✅ **Zero regressões** em funcionalidades da Sprint 1

**Stretch Goals (Bônus):**

- 🎯 Tags implementadas (US-022)
- 🎯 35% coverage alcançada
- 🎯 5+ testes E2E

---

## 📝 Notas do Planning

### Decisões Tomadas

1. ✅ **30% coverage é suficiente** (reafirmado)
2. ✅ **Priorizar Dashboard + Contatos** sobre outras features
3. ✅ **CI/CD é must-have** nesta sprint
4. ✅ **E2E é nice-to-have** (setup mínimo)
5. ✅ **Tags podem ser movidas** para Sprint 3 se necessário

### Dúvidas Esclarecidas

- **Q:** Precisamos de gráfico de funil agora?
- **A:** Não, fica para Sprint 6 (US-015)

- **Q:** Importação de CSV entra nesta sprint?
- **A:** Não, é US-023 (Sprint 3+)

- **Q:** Quantos filtros no dashboard?
- **A:** Apenas período (7d, 30d, 90d) por ora

### Action Items Pós-Planning

- [ ] Criar branch `sprint-2`
- [ ] Criar issues no GitHub (9 issues)
- [ ] Configurar GitHub Projects
- [ ] Agendar Daily Scrum (9h30 todo dia)
- [ ] Preparar ambiente de desenvolvimento

---

**Status:** 🟢 **SPRINT 2 READY TO START**

**Próxima Cerimônia:** Daily Scrum - Dia 1 às 9h30

**Sprint 2 Start Date:** 27 de novembro de 2025 🚀
