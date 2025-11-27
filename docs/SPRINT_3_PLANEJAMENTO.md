# Sprint 3 - Automações e Integrações

**Início:** 28/11/2024  
**Duração:** 2 semanas  
**Meta:** 30 pontos (80%)  
**Foco:** Automações, relatórios e integrações

---

## 🎯 Objetivos da Sprint 3

### Temas Principais

1. **Automações** - Workflows e ações automáticas
2. **Relatórios** - Analytics e exportações
3. **Integrações** - Email e notificações
4. **Refinamento** - Melhorias técnicas do code review

---

## 📋 User Stories (Backlog)

### Epic 4: Automações e Workflows

#### US-026: Funil de Vendas Automatizado (5 pts)

**Como** usuário  
**Quero** que negócios avancem automaticamente pelo funil  
**Para** reduzir trabalho manual

**Critérios:**

- [ ] Regras de transição automática por tempo
- [ ] Notificação quando negócio fica parado
- [ ] Ações automáticas (ex: enviar email após 3 dias)
- [ ] Dashboard de automações ativas

**Tarefas Técnicas:**

- [ ] Criar tabela `automation_rules`
- [ ] Criar API `/api/automations`
- [ ] Criar componente AutomationRules
- [ ] Job para processar regras (cron)
- [ ] Testes de automação

---

#### US-027: Notificações em Tempo Real (3 pts)

**Como** usuário  
**Quero** receber notificações de eventos importantes  
**Para** não perder oportunidades

**Critérios:**

- [ ] Notificação quando negócio muda de status
- [ ] Notificação de novos contatos
- [ ] Centro de notificações no header
- [ ] Badge com contador de não lidas
- [ ] Marcar como lida/deletar

**Tarefas Técnicas:**

- [ ] Criar tabela `notifications`
- [ ] Criar API `/api/notifications`
- [ ] Criar componente NotificationCenter
- [ ] Real-time com Supabase Realtime
- [ ] Testes de notificações

---

#### US-028: Tarefas e Lembretes (5 pts)

**Como** usuário  
**Quero** criar tarefas vinculadas a contatos/negócios  
**Para** organizar meu trabalho

**Critérios:**

- [ ] Criar tarefa com título, descrição, data
- [ ] Vincular a contato ou negócio
- [ ] Status: pendente, em andamento, concluída
- [ ] Lista de tarefas no dashboard
- [ ] Notificação de tarefas atrasadas

**Tarefas Técnicas:**

- [ ] Criar tabela `tasks`
- [ ] Criar API `/api/tasks`
- [ ] Criar componente TaskList e TaskForm
- [ ] Integração com contatos/negócios
- [ ] Testes de tarefas

---

### Epic 5: Relatórios e Analytics

#### US-029: Relatório de Conversão (3 pts)

**Como** gestor  
**Quero** ver taxa de conversão por etapa do funil  
**Para** identificar gargalos

**Critérios:**

- [ ] Gráfico de funil com conversão por etapa
- [ ] Taxa de conversão total (lead → cliente)
- [ ] Tempo médio por etapa
- [ ] Filtro por período
- [ ] Exportar relatório PDF/Excel

**Tarefas Técnicas:**

- [ ] Criar API `/api/reports/conversion`
- [ ] Query SQL para calcular conversões
- [ ] Componente FunnelChart (Recharts)
- [ ] Exportação PDF (react-pdf)
- [ ] Testes de relatórios

---

#### US-030: Exportar Dados (3 pts)

**Como** usuário  
**Quero** exportar contatos e negócios  
**Para** usar em outras ferramentas

**Critérios:**

- [ ] Exportar contatos filtrados (CSV/Excel)
- [ ] Exportar negócios por status (CSV/Excel)
- [ ] Incluir campos customizados
- [ ] Exportar com tags
- [ ] Download automático do arquivo

**Tarefas Técnicas:**

- [ ] Criar API `/api/exports/contacts`
- [ ] Criar API `/api/exports/deals`
- [ ] Biblioteca xlsx para Excel
- [ ] Componente ExportButton
- [ ] Testes de exportação

---

#### US-031: Dashboard Analytics Avançado (5 pts)

**Como** gestor  
**Quero** ver métricas avançadas de performance  
**Para** tomar decisões baseadas em dados

**Critérios:**

- [ ] Gráfico de origem de leads (Fonte: site, indicação, etc)
- [ ] Performance de vendedor (se multi-usuário)
- [ ] Receita prevista vs realizada
- [ ] Tendências (crescimento mês a mês)
- [ ] Metas e progresso

**Tarefas Técnicas:**

- [ ] Criar API `/api/dashboard/analytics`
- [ ] Queries SQL complexas (agregações)
- [ ] Componentes de gráficos (Recharts)
- [ ] Cache de queries pesadas
- [ ] Testes de performance

---

### Epic 6: Integrações

#### US-032: Integração com Email (8 pts)

**Como** usuário  
**Quero** enviar emails diretamente do CRM  
**Para** centralizar comunicação

**Critérios:**

- [ ] Enviar email para contato
- [ ] Templates de email
- [ ] Histórico de emails enviados
- [ ] Variáveis dinâmicas (nome, empresa, etc)
- [ ] Tracking de abertura (opcional)

**Tarefas Técnicas:**

- [ ] Integração com serviço de email (SendGrid/Resend)
- [ ] Criar tabela `email_templates` e `email_logs`
- [ ] Criar API `/api/emails/send`
- [ ] Componente EmailComposer
- [ ] Testes de integração

---

#### US-033: Webhooks (3 pts)

**Como** desenvolvedor  
**Quero** receber notificações de eventos via webhook  
**Para** integrar com outras ferramentas

**Critérios:**

- [ ] Configurar webhook URL
- [ ] Eventos: novo contato, negócio fechado, etc
- [ ] Payload JSON com dados do evento
- [ ] Retry automático em caso de falha
- [ ] Log de webhooks enviados

**Tarefas Técnicas:**

- [ ] Criar tabela `webhooks` e `webhook_logs`
- [ ] Criar API `/api/webhooks`
- [ ] Sistema de dispatch de eventos
- [ ] Queue para envio assíncrono
- [ ] Testes de webhooks

---

### Epic 7: Melhorias Técnicas (Code Review)

#### US-034: Refatoração de Código (5 pts)

**Como** desenvolvedor  
**Quero** código mais limpo e manutenível  
**Para** facilitar evolução do sistema

**Critérios:**

- [ ] Refatorar funções grandes (>50 linhas)
- [ ] Extrair responsabilidades
- [ ] Adicionar Error Boundaries
- [ ] Criar API Client centralizado
- [ ] Adicionar React.memo em componentes

**Tarefas Técnicas:**

- [ ] Refatorar ContactsList.fetchContacts()
- [ ] Refatorar ContactForm.onSubmit()
- [ ] Criar src/lib/api-client.ts
- [ ] Criar ErrorBoundary component
- [ ] Memoizar ContactCard, TagFilter, etc

**Referência:** docs/CODE_REVIEW_SPRINT_2.md

---

#### US-035: Testes E2E (3 pts)

**Como** desenvolvedor  
**Quero** testes end-to-end  
**Para** garantir fluxos completos

**Critérios:**

- [ ] Setup Playwright ou Cypress
- [ ] Teste: Login → Criar contato → Filtrar
- [ ] Teste: Criar negócio → Mover pipeline
- [ ] Teste: Buscar contatos → Exportar
- [ ] CI/CD com testes automatizados

**Tarefas Técnicas:**

- [ ] Instalar Playwright
- [ ] Criar tests/e2e/
- [ ] Escrever 5+ testes principais
- [ ] Integrar com GitHub Actions
- [ ] Documentar testes

---

#### US-036: Documentação API (2 pts)

**Como** desenvolvedor  
**Quero** documentação OpenAPI/Swagger  
**Para** facilitar consumo das APIs

**Critérios:**

- [ ] Documentação de todos os endpoints
- [ ] Exemplos de request/response
- [ ] Códigos de erro documentados
- [ ] Swagger UI acessível
- [ ] Geração automática de tipos

**Tarefas Técnicas:**

- [ ] Instalar swagger-jsdoc
- [ ] Documentar APIs com JSDoc
- [ ] Criar rota /api/docs
- [ ] Swagger UI component
- [ ] Sincronizar com Postman

---

## 📊 Resumo da Sprint 3

### Distribuição de Pontos

| Epic                    | User Stories           | Pontos     | Prioridade |
| ----------------------- | ---------------------- | ---------- | ---------- |
| **Epic 4: Automações**  | US-026, US-027, US-028 | 13 pts     | 🔴 Alta    |
| **Epic 5: Relatórios**  | US-029, US-030, US-031 | 11 pts     | 🟡 Média   |
| **Epic 6: Integrações** | US-032, US-033         | 11 pts     | 🟢 Baixa   |
| **Epic 7: Melhorias**   | US-034, US-035, US-036 | 10 pts     | 🟡 Média   |
| **TOTAL**               | 12 User Stories        | **45 pts** | -          |

### Meta de 80%

```
Meta:       36 pontos (80% de 45)
Stretch:    45 pontos (100%)
Mínimo:     30 pontos (67%)
```

---

## 🎯 Priorização Sugerida

### Sprint 3 - Mínimo Viável (30 pts)

**Semana 1:**

1. US-026: Funil Automatizado (5 pts) - **ALTA**
2. US-027: Notificações (3 pts) - **ALTA**
3. US-028: Tarefas (5 pts) - **ALTA**
4. US-029: Relatório Conversão (3 pts) - **MÉDIA**
5. US-030: Exportar Dados (3 pts) - **MÉDIA**

**Subtotal Semana 1:** 19 pontos

**Semana 2:** 6. US-034: Refatoração (5 pts) - **MÉDIA** 7. US-031: Dashboard Analytics (5 pts) - **MÉDIA** 8. US-035: Testes E2E (3 pts) - **MÉDIA**

**Subtotal Semana 2:** 13 pontos

**TOTAL:** 32 pontos ✅ (acima da meta)

---

### Backlog para Sprint 4 (15 pts)

- US-032: Email (8 pts)
- US-033: Webhooks (3 pts)
- US-036: Doc API (2 pts)
- Melhorias adicionais (2 pts)

---

## 🛠️ Tecnologias Novas

### Para Sprint 3

1. **Automações:**
   - Vercel Cron Jobs ou Supabase Edge Functions
   - pg_cron (PostgreSQL)

2. **Notificações:**
   - Supabase Realtime (WebSockets)
   - React Context para estado global

3. **Exportação:**
   - xlsx (Excel)
   - react-pdf (PDF)

4. **Testes E2E:**
   - Playwright ou Cypress
   - GitHub Actions CI/CD

5. **Cache:**
   - React Query ou SWR
   - Redis (opcional)

---

## 📈 Métricas de Sucesso

### KPIs da Sprint 3

1. **Funcionalidade:**
   - [ ] 30+ pontos entregues
   - [ ] 8+ User Stories completas
   - [ ] Zero bugs críticos

2. **Qualidade:**
   - [ ] Cobertura de testes >85%
   - [ ] Code review score >9.0/10
   - [ ] Performance <500ms

3. **Documentação:**
   - [ ] Docs de todas as features
   - [ ] Guia de automações
   - [ ] API docs completas

---

## 🔄 Cerimônias

### Planning (28/11 - 2h)

- Review do Sprint 2
- Planejamento do Sprint 3
- Estimativas e compromissos

### Dailies (15min/dia)

- O que fiz ontem
- O que farei hoje
- Impedimentos

### Review (11/12 - 1h)

- Demo das features
- Feedback dos stakeholders

### Retrospectiva (11/12 - 1h)

- O que foi bem
- O que melhorar
- Ações para Sprint 4

---

## 📝 Notas

### Dependências Técnicas

1. **Automações** requer job scheduler (cron)
2. **Notificações** requer Realtime ativo
3. **Email** requer conta SendGrid/Resend
4. **Webhooks** requer queue system

### Riscos Identificados

1. ⚠️ **Complexidade das automações** - POC primeiro
2. ⚠️ **Integração email** - Pode ter custo
3. ⚠️ **Real-time** - Pode ter latência
4. ⚠️ **Testes E2E** - Curva de aprendizado

### Mitigações

1. Começar com automações simples
2. Usar tier gratuito de email services
3. Fallback para polling se WebSocket falhar
4. Pair programming para E2E

---

## 🎯 Definition of Done

### Para Cada User Story

- [ ] Código implementado e revisado
- [ ] Testes unitários passando
- [ ] Testes E2E (se aplicável)
- [ ] Documentação atualizada
- [ ] Code review aprovado
- [ ] Deploy em staging testado
- [ ] Aceito pelo PO

---

## 🚀 Próximos Passos

### Antes do Planning

1. [ ] Refinar User Stories com time
2. [ ] Validar estimativas
3. [ ] Priorizar com stakeholders
4. [ ] Preparar ambiente (cron, realtime, etc)

### Durante a Sprint

1. [ ] Seguir priorização sugerida
2. [ ] Fazer code review diário
3. [ ] Atualizar documentação
4. [ ] Testar continuamente

---

**Preparado por:** Time de Desenvolvimento  
**Data:** 27/11/2024  
**Status:** 📋 Pronto para Planning  
**Próxima Reunião:** 28/11/2024 09:00
