# Planejamento de Projeto - CRM Simplificado

## Metodologia Ágil Scrum + Engenharia de Software

**Projeto:** Sistema de CRM com Integração WhatsApp  
**Data de Início:** 25 de novembro de 2025  
**Metodologia:** Scrum  
**Duração Estimada:** 6 Sprints (12 semanas)  
**Product Owner:** Eveneto  
**Scrum Master:** [A definir]  
**Dev Team:** [A definir]

---

## 1. Visão do Produto (Product Vision)

### 1.1 Problema

Pequenas e médias empresas precisam gerenciar relacionamento com clientes, conversas de WhatsApp e pipeline de vendas de forma integrada, mas soluções existentes são caras, complexas ou fragmentadas.

### 1.2 Solução

Sistema de CRM completo, moderno e acessível com:

- ✅ Gestão de conversas WhatsApp em tempo real
- ✅ Pipeline de vendas visual (Kanban)
- ✅ Gestão de contatos e atividades
- ✅ Dashboard com métricas
- ✅ Interface intuitiva e responsiva

### 1.3 Proposta de Valor

> "Um CRM profissional e integrado que cabe no bolso de qualquer empresa, desenvolvido com as melhores práticas de engenharia de software."

### 1.4 Objetivos SMART

| Objetivo       | Descrição                                         | Métrica de Sucesso                  |
| -------------- | ------------------------------------------------- | ----------------------------------- |
| **S**pecific   | Desenvolver CRM funcional com integração WhatsApp | 100% das features MVP implementadas |
| **M**easurable | Atingir 95% de cobertura de testes                | Coverage ≥ 95%                      |
| **A**chievable | Entregar MVP em 12 semanas                        | 6 sprints de 2 semanas              |
| **R**elevant   | Código limpo e manutenível                        | 0 code smells críticos (SonarQube)  |
| **T**ime-bound | Deploy em produção até 10/02/2026                 | Data fixa                           |

---

## 2. Papéis e Responsabilidades (Scrum Roles)

### 2.1 Product Owner (PO)

**Responsabilidades:**

- Definir e priorizar Product Backlog
- Aceitar/rejeitar entregáveis (Definition of Done)
- Representar stakeholders
- Participar de Sprint Planning e Review

### 2.2 Scrum Master (SM)

**Responsabilidades:**

- Facilitar cerimônias Scrum
- Remover impedimentos
- Garantir aderência ao processo
- Proteger o time de interrupções externas

### 2.3 Development Team (Dev Team)

**Responsabilidades:**

- Desenvolver features
- Escrever testes
- Fazer code review
- Estimar user stories
- Auto-organização

**Habilidades necessárias:**

- TypeScript/React/Next.js
- Node.js/API REST
- PostgreSQL/Supabase
- Git/GitHub
- Clean Code

---

## 3. Artefatos Scrum

### 3.1 Product Backlog

Priorizado usando **MoSCoW** (Must have, Should have, Could have, Won't have):

#### Epic 1: Autenticação e Autorização

**Must Have:**

- [ ] US-001: Login por e-mail/senha
- [ ] US-002: Registro de novos usuários
- [ ] US-003: Recuperação de senha
- [ ] US-004: Perfis de usuário (Admin, Manager, Agent)
- [ ] US-005: Proteção de rotas

**Should Have:**

- [ ] US-006: Login social (Google)
- [ ] US-007: Autenticação 2FA

#### Epic 2: Dashboard e Visualização

**Must Have:**

- [ ] US-008: Dashboard principal com métricas
- [ ] US-009: Cards de KPIs (vendas, conversas, conversão)
- [ ] US-010: Gráfico de vendas por período
- [ ] US-011: Lista de negócios recentes
- [ ] US-012: Sidebar de navegação
- [ ] US-013: Header com perfil do usuário
- [ ] US-014: Tema dark/light

**Should Have:**

- [ ] US-015: Gráfico de funil de vendas
- [ ] US-016: Filtros por período

#### Epic 3: Gestão de Contatos

**Must Have:**

- [ ] US-017: Listar contatos
- [ ] US-018: Criar novo contato
- [ ] US-019: Editar contato
- [ ] US-020: Visualizar detalhes do contato
- [ ] US-021: Buscar contatos
- [ ] US-022: Tags em contatos

**Should Have:**

- [ ] US-023: Importar contatos (CSV)
- [ ] US-024: Exportar contatos
- [ ] US-025: Campos customizados

#### Epic 4: Conversas WhatsApp

**Must Have:**

- [ ] US-026: Listar conversas
- [ ] US-027: Visualizar histórico de mensagens
- [ ] US-028: Enviar mensagens de texto
- [ ] US-029: Receber mensagens (webhook)
- [ ] US-030: Notificações em tempo real
- [ ] US-031: Status da conversa (aberta/fechada)
- [ ] US-032: Atribuir conversa a atendente

**Should Have:**

- [ ] US-033: Enviar imagens/documentos
- [ ] US-034: Mensagens rápidas (templates)
- [ ] US-035: Notas internas na conversa

**Could Have:**

- [ ] US-036: Chatbot básico
- [ ] US-037: Respostas automáticas

#### Epic 5: CRM - Pipeline de Vendas

**Must Have:**

- [ ] US-038: Kanban de negócios
- [ ] US-039: Criar novo negócio
- [ ] US-040: Editar negócio
- [ ] US-041: Mover negócio entre estágios (drag-and-drop)
- [ ] US-042: Visualizar detalhes do negócio
- [ ] US-043: Associar negócio a contato
- [ ] US-044: Definir valor do negócio
- [ ] US-045: Marcar negócio como ganho/perdido

**Should Have:**

- [ ] US-046: Estágios customizáveis
- [ ] US-047: Filtrar negócios por status
- [ ] US-048: Previsão de fechamento

#### Epic 6: Atividades

**Must Have:**

- [ ] US-049: Criar atividade (ligação, reunião, tarefa)
- [ ] US-050: Listar atividades
- [ ] US-051: Marcar atividade como concluída
- [ ] US-052: Atribuir atividade a usuário

**Should Have:**

- [ ] US-053: Lembretes de atividades
- [ ] US-054: Calendário de atividades

#### Epic 7: Canais de Atendimento

**Must Have:**

- [ ] US-055: Listar canais conectados
- [ ] US-056: Conectar número WhatsApp (QR Code)
- [ ] US-057: Desconectar canal
- [ ] US-058: Status de conexão

**Should Have:**

- [ ] US-059: Múltiplos números WhatsApp
- [ ] US-060: Webhook configurável

#### Epic 8: Configurações

**Must Have:**

- [ ] US-061: Perfil do usuário
- [ ] US-062: Alterar senha
- [ ] US-063: Configurações da empresa

**Should Have:**

- [ ] US-064: Gerenciar usuários (Admin)
- [ ] US-065: Logs de auditoria

---

### 3.2 Sprint Backlog

#### Sprint 1 (Semanas 1-2): Fundação

**Objetivo:** Setup completo + Autenticação + Layout básico

**User Stories:**

- US-001: Login por e-mail/senha (5 pts)
- US-002: Registro de novos usuários (3 pts)
- US-003: Recuperação de senha (3 pts)
- US-004: Perfis de usuário (5 pts)
- US-005: Proteção de rotas (3 pts)
- US-012: Sidebar de navegação (5 pts)
- US-013: Header com perfil (3 pts)
- US-014: Tema dark/light (2 pts)

**Total:** 29 Story Points  
**Capacity:** 30 Story Points

**Tarefas Técnicas:**

- [ ] Setup Supabase (banco + auth)
- [ ] Criar schema do banco
- [ ] Implementar middleware de autenticação
- [ ] Desenvolver componentes de layout
- [ ] Escrever testes unitários
- [ ] Configurar CI/CD

**Definition of Done:**

- [ ] Código revisado e aprovado
- [ ] Testes com ≥ 80% coverage
- [ ] Build passa sem erros
- [ ] Deploy em ambiente de staging
- [ ] Documentação atualizada

---

#### Sprint 2 (Semanas 3-4): Dashboard + Contatos

**Objetivo:** Dashboard funcional + CRUD de contatos

**User Stories:**

- US-008: Dashboard principal (8 pts)
- US-009: Cards de KPIs (5 pts)
- US-010: Gráfico de vendas (5 pts)
- US-017: Listar contatos (3 pts)
- US-018: Criar contato (3 pts)
- US-019: Editar contato (3 pts)
- US-020: Visualizar contato (2 pts)
- US-021: Buscar contatos (3 pts)

**Total:** 32 Story Points

**Tarefas Técnicas:**

- [ ] Integrar Recharts
- [ ] Criar componentes de dashboard
- [ ] Implementar API de contatos
- [ ] Desenvolver formulários
- [ ] Testes E2E de fluxos críticos

---

#### Sprint 3 (Semanas 5-6): WhatsApp - Parte 1

**Objetivo:** Integração WhatsApp + Conversas básicas

**User Stories:**

- US-026: Listar conversas (5 pts)
- US-027: Histórico de mensagens (5 pts)
- US-028: Enviar mensagens (5 pts)
- US-029: Receber mensagens (8 pts)
- US-030: Notificações em tempo real (8 pts)
- US-055: Listar canais (3 pts)
- US-056: Conectar WhatsApp (8 pts)

**Total:** 42 Story Points (Sprint mais pesada)

**Tarefas Técnicas:**

- [ ] Setup Evolution API
- [ ] Implementar webhook
- [ ] Configurar Supabase Realtime
- [ ] Desenvolver componente de chat
- [ ] Testes de integração com WhatsApp

---

#### Sprint 4 (Semanas 7-8): WhatsApp - Parte 2 + Kanban

**Objetivo:** Completar conversas + Pipeline de vendas

**User Stories:**

- US-031: Status da conversa (2 pts)
- US-032: Atribuir conversa (3 pts)
- US-038: Kanban de negócios (13 pts)
- US-039: Criar negócio (3 pts)
- US-040: Editar negócio (3 pts)
- US-041: Drag-and-drop (8 pts)
- US-042: Detalhes do negócio (3 pts)

**Total:** 35 Story Points

**Tarefas Técnicas:**

- [ ] Implementar @dnd-kit
- [ ] Criar store Zustand para Kanban
- [ ] Desenvolver componentes de deal
- [ ] Otimistic updates
- [ ] Testes de drag-and-drop

---

#### Sprint 5 (Semanas 9-10): Negócios + Atividades

**Objetivo:** Completar CRM + Gestão de atividades

**User Stories:**

- US-043: Associar negócio a contato (3 pts)
- US-044: Definir valor (2 pts)
- US-045: Ganho/Perdido (3 pts)
- US-049: Criar atividade (5 pts)
- US-050: Listar atividades (3 pts)
- US-051: Concluir atividade (2 pts)
- US-052: Atribuir atividade (2 pts)
- US-022: Tags em contatos (3 pts)
- US-061: Perfil do usuário (3 pts)
- US-062: Alterar senha (2 pts)

**Total:** 28 Story Points

---

#### Sprint 6 (Semanas 11-12): Polimento + Deploy

**Objetivo:** Refinamento + Deploy em produção

**User Stories:**

- US-015: Gráfico de funil (5 pts)
- US-033: Enviar mídia (5 pts)
- US-034: Mensagens rápidas (5 pts)
- US-057: Desconectar canal (2 pts)
- US-058: Status de conexão (2 pts)
- US-063: Config da empresa (3 pts)

**Total:** 22 Story Points

**Tarefas Técnicas:**

- [ ] Performance optimization
- [ ] Testes de carga
- [ ] Segurança (penetration testing)
- [ ] Documentação completa
- [ ] Deploy em produção
- [ ] Monitoramento (Sentry/Analytics)

---

### 3.3 Incremento (Product Increment)

Cada Sprint entrega um **incremento potencialmente liberável**:

| Sprint | Incremento                        | Valor Entregue                           |
| ------ | --------------------------------- | ---------------------------------------- |
| 1      | Sistema com autenticação + layout | Usuários podem fazer login e navegar     |
| 2      | Dashboard + Contatos              | Visualizar métricas e gerenciar contatos |
| 3      | WhatsApp integrado                | Receber e enviar mensagens               |
| 4      | Pipeline de vendas                | Gerenciar negócios visualmente           |
| 5      | CRM completo                      | Atividades e workflow completo           |
| 6      | Produto final                     | Sistema pronto para produção             |

---

## 4. Cerimônias Scrum

### 4.1 Sprint Planning (Início de cada Sprint)

**Duração:** 4h (Sprint de 2 semanas)  
**Participantes:** PO, SM, Dev Team

**Agenda:**

1. **Parte 1 (2h):** O QUE fazer
   - PO apresenta prioridades do Product Backlog
   - Time discute e esclarece User Stories
   - Seleção das User Stories para a Sprint

2. **Parte 2 (2h):** COMO fazer
   - Time quebra User Stories em tarefas técnicas
   - Estimativas usando Planning Poker
   - Criação do Sprint Backlog

**Output:** Sprint Goal + Sprint Backlog

---

### 4.2 Daily Scrum (Diário)

**Duração:** 15 minutos  
**Horário:** 9h30 (mesmo horário todos os dias)  
**Formato:** Stand-up (de pé)

**3 Perguntas:**

1. O que eu fiz ontem?
2. O que vou fazer hoje?
3. Há algum impedimento?

**Regras:**

- Máximo 15 minutos
- Foco em sincronização, não resolução de problemas
- Problemas complexos → discussão após Daily

---

### 4.3 Sprint Review (Fim da Sprint)

**Duração:** 2h  
**Participantes:** PO, SM, Dev Team, Stakeholders

**Agenda:**

1. Demonstração do incremento (30 min)
2. Feedback dos stakeholders (30 min)
3. Revisão do Product Backlog (30 min)
4. Próximos passos (30 min)

**Output:** Product Backlog atualizado

---

### 4.4 Sprint Retrospective (Após Review)

**Duração:** 1h30  
**Participantes:** SM, Dev Team (PO opcional)

**Formato:** Start-Stop-Continue

- ✅ **Start:** O que devemos começar a fazer?
- ❌ **Stop:** O que devemos parar de fazer?
- ➡️ **Continue:** O que está funcionando bem?

**Output:** Plano de ação para melhoria contínua

---

## 5. Critérios de Qualidade

### 5.1 Definition of Ready (DoR)

Uma User Story está pronta para desenvolvimento quando:

- [ ] Tem critérios de aceitação claros
- [ ] Foi estimada pelo time
- [ ] Tem mockups/designs (se UI)
- [ ] Dependências identificadas e resolvidas
- [ ] Cabe em uma Sprint
- [ ] Time entendeu completamente

### 5.2 Definition of Done (DoD)

Uma User Story está completa quando:

- [ ] Código desenvolvido e commitado
- [ ] Code review aprovado (mínimo 1 aprovação)
- [ ] Testes unitários escritos (coverage ≥ 80%)
- [ ] Testes de integração (se aplicável)
- [ ] Build passa sem erros/warnings
- [ ] Deploy em staging realizado
- [ ] Documentação atualizada
- [ ] PO aceitou a entrega
- [ ] Segue 100% o CODE_REVIEW_GUIDE.md

### 5.3 Métricas de Qualidade

| Métrica                  | Meta       | Ferramenta |
| ------------------------ | ---------- | ---------- |
| Cobertura de Testes      | ≥ 80%      | Jest       |
| Complexidade Ciclomática | ≤ 10       | ESLint     |
| Duplicação de Código     | ≤ 3%       | SonarQube  |
| Vulnerabilidades         | 0 críticas | Snyk       |
| Performance (LCP)        | < 2.5s     | Lighthouse |
| Acessibilidade           | Score ≥ 90 | Lighthouse |
| Code Smells              | 0 críticos | SonarQube  |

---

## 6. Estimativas e Velocity

### 6.1 Planning Poker

**Escala de Fibonacci:** 1, 2, 3, 5, 8, 13, 21

| Points | Complexidade   | Tempo Estimado | Exemplo                     |
| ------ | -------------- | -------------- | --------------------------- |
| 1      | Trivial        | 1-2h           | Alterar texto/cor           |
| 2      | Muito Simples  | 2-4h           | Adicionar campo no form     |
| 3      | Simples        | 4-8h           | CRUD simples                |
| 5      | Média          | 1-2 dias       | Feature com lógica moderada |
| 8      | Complexa       | 2-3 dias       | Integração externa          |
| 13     | Muito Complexa | 3-5 dias       | Kanban drag-and-drop        |
| 21     | Épico          | > 5 dias       | Quebrar em stories menores  |

### 6.2 Velocity Tracking

| Sprint | Committed | Completed | Velocity |
| ------ | --------- | --------- | -------- |
| 1      | 30        | ?         | Baseline |
| 2      | 32        | ?         | -        |
| 3      | 42        | ?         | -        |
| 4      | 35        | ?         | -        |
| 5      | 28        | ?         | -        |
| 6      | 22        | ?         | -        |

**Meta:** Velocity estável entre 28-35 pontos/sprint

---

## 7. Gestão de Riscos

### 7.1 Matriz de Riscos

| Risco                             | Probabilidade | Impacto | Mitigação                                         |
| --------------------------------- | ------------- | ------- | ------------------------------------------------- |
| Evolution API instável            | Média         | Alto    | Testar integração cedo, ter plano B (API oficial) |
| Mudanças de escopo                | Alta          | Médio   | Product Backlog priorizado, PO decisivo           |
| Falta de conhecimento técnico     | Baixa         | Alto    | Pair programming, documentação detalhada          |
| Bugs críticos em produção         | Média         | Alto    | Testes automatizados, CI/CD, staging environment  |
| Supabase atingir limite free tier | Baixa         | Médio   | Monitorar uso, planejar upgrade                   |
| Membro do time sair               | Baixa         | Alto    | Documentação, knowledge sharing                   |

---

## 8. Ferramentas e Processos

### 8.1 Stack de Desenvolvimento

```
Frontend:    Next.js 14 + TypeScript + Tailwind
Backend:     Supabase (PostgreSQL + Auth + Realtime)
WhatsApp:    Evolution API
Deploy:      Vercel
Monitoring:  Sentry + Vercel Analytics
```

### 8.2 Ferramentas de Gestão

| Ferramenta          | Uso                              |
| ------------------- | -------------------------------- |
| **GitHub Projects** | Product Backlog + Sprint Backlog |
| **GitHub Issues**   | User Stories + Bugs              |
| **GitHub Actions**  | CI/CD pipeline                   |
| **Slack/Discord**   | Comunicação do time              |
| **Figma**           | Design/Mockups                   |
| **Miro**            | Retrospectives + Brainstorming   |
| **SonarQube**       | Qualidade de código              |

### 8.3 Workflow Git

```
main (produção)
  ↑
develop (staging)
  ↑
feature/US-XXX (development)
```

**Regras:**

- Feature branch para cada User Story
- PR obrigatório com code review
- Squash merge para manter histórico limpo
- Deploy automático: `develop` → staging, `main` → production

### 8.4 CI/CD Pipeline

```yaml
On Push/PR: 1. Lint (ESLint)
  2. Type Check (TypeScript)
  3. Unit Tests (Jest)
  4. Build
  5. Integration Tests
  6. Deploy to Staging (se develop)
  7. Deploy to Production (se main + tag)
```

---

## 9. Monitoramento e KPIs

### 9.1 KPIs de Projeto

| KPI                      | Meta             | Frequência |
| ------------------------ | ---------------- | ---------- |
| Velocity                 | 28-35 pts/sprint | Por sprint |
| Sprint Goal Success Rate | 100%             | Por sprint |
| Code Coverage            | ≥ 80%            | Contínuo   |
| Bugs em Produção         | ≤ 2/sprint       | Semanal    |
| Time de Deploy           | < 10 min         | Contínuo   |
| Uptime                   | ≥ 99.5%          | Mensal     |

### 9.2 KPIs de Negócio (Pós-lançamento)

| KPI                     | Meta           | Frequência |
| ----------------------- | -------------- | ---------- |
| Usuários Ativos (MAU)   | 100 em 3 meses | Mensal     |
| Mensagens enviadas      | 1000/mês       | Mensal     |
| Deals criados           | 500/mês        | Mensal     |
| Tempo médio de resposta | < 5 min        | Semanal    |
| NPS                     | ≥ 50           | Trimestral |

---

## 10. Roadmap de Releases

### Release 1.0 - MVP (Fim Sprint 6)

**Data:** 10/02/2026  
**Features:**

- ✅ Autenticação completa
- ✅ Dashboard com métricas
- ✅ Gestão de contatos
- ✅ Conversas WhatsApp
- ✅ Pipeline de vendas (Kanban)
- ✅ Atividades básicas

### Release 1.1 - Melhorias (Sprint 7-8)

**Data:** 24/03/2026  
**Features:**

- Templates de mensagens
- Chatbot básico
- Importação de contatos
- Relatórios avançados

### Release 2.0 - Escalabilidade (Sprint 9-12)

**Data:** 19/05/2026  
**Features:**

- Múltiplos canais (Telegram, Webchat)
- Automações (workflows)
- Integrações (Zapier, Make)
- API pública

---

## 11. Anexos

### 11.1 Template de User Story

```markdown
## US-XXX: [Título da User Story]

**Como** [tipo de usuário]
**Eu quero** [realizar uma ação]
**Para que** [obter um benefício]

### Critérios de Aceitação

- [ ] Dado [contexto]
- [ ] Quando [ação]
- [ ] Então [resultado esperado]

### Definição Técnica

- Endpoint: `POST /api/deals`
- Componente: `src/components/kanban/deal-card.tsx`
- Store: `use-deals-store.ts`

### Dependências

- US-017 (Listar contatos) deve estar completa

### Estimativa

5 Story Points

### Prioridade

Must Have
```

### 11.2 Template de Bug

```markdown
## Bug-XXX: [Título do Bug]

### Descrição

[Descrição clara do problema]

### Passos para Reproduzir

1. Acesse a página X
2. Clique no botão Y
3. Observe o erro Z

### Comportamento Esperado

[O que deveria acontecer]

### Comportamento Atual

[O que está acontecendo]

### Screenshots/Vídeos

[Anexar evidências]

### Ambiente

- Browser: Chrome 120
- OS: Ubuntu 22.04
- Versão: 1.0.0

### Severidade

🔴 Crítico / 🟡 Médio / 🟢 Baixo

### Logs
```

[Stack trace ou logs relevantes]

```

```

---

## 12. Compromisso da Equipe

**Nós, membros do time de desenvolvimento do CRM Simplificado, nos comprometemos a:**

✅ Seguir os princípios do Manifesto Ágil  
✅ Participar ativamente de todas as cerimônias Scrum  
✅ Escrever código limpo seguindo o CODE_REVIEW_GUIDE.md  
✅ Manter testes automatizados com alta cobertura  
✅ Fazer code review construtivo e respeitoso  
✅ Comunicar impedimentos imediatamente  
✅ Entregar incrementos de valor a cada Sprint  
✅ Buscar melhoria contínua

---

## 13. Glossário

| Termo               | Definição                                                    |
| ------------------- | ------------------------------------------------------------ |
| **Sprint**          | Período de 2 semanas de desenvolvimento                      |
| **Story Point**     | Unidade de estimativa de complexidade                        |
| **Velocity**        | Quantidade de Story Points completados por Sprint            |
| **Product Backlog** | Lista priorizada de todas as funcionalidades                 |
| **Sprint Backlog**  | Conjunto de User Stories da Sprint atual                     |
| **Incremento**      | Produto potencialmente liberável ao fim da Sprint            |
| **DoR**             | Definition of Ready - critérios para iniciar desenvolvimento |
| **DoD**             | Definition of Done - critérios para considerar completo      |
| **MVP**             | Minimum Viable Product - versão mínima funcional             |
| **Epic**            | Conjunto grande de funcionalidades relacionadas              |
| **User Story**      | Requisito descrito da perspectiva do usuário                 |

---

**Documento aprovado por:** [Product Owner]  
**Data:** 25/11/2025  
**Versão:** 1.0  
**Próxima revisão:** Após Sprint 1 (Retrospective)

---

> "A agilidade não é sobre velocidade, é sobre capacidade de adaptação e entrega contínua de valor."  
> — Manifesto Ágil
