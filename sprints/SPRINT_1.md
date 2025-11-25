# Sprint 1 - Fundação do Sistema

**Período:** 25/11/2025 - 08/12/2025 (2 semanas)  
**Sprint Goal:** "Implementar autenticação completa e layout básico funcional"

---

## 📋 Sprint Planning

**Data:** 25/11/2025  
**Duração:** 4h  
**Participantes:** Product Owner, Scrum Master, Dev Team

### Sprint Goal

> Entregar um sistema com autenticação funcional (login, registro, recuperação de senha) e layout principal navegável (sidebar + header + tema), permitindo que usuários façam login e acessem o dashboard.

---

## 🎯 User Stories Selecionadas

| ID     | User Story             | Estimativa | Status   | Responsável |
| ------ | ---------------------- | ---------- | -------- | ----------- |
| US-001 | Login por e-mail/senha | 5 pts      | ⏳ To Do | -           |
| US-002 | Registro de usuários   | 3 pts      | ⏳ To Do | -           |
| US-003 | Recuperação de senha   | 3 pts      | ⏳ To Do | -           |
| US-004 | Perfis de usuário      | 5 pts      | ⏳ To Do | -           |
| US-005 | Proteção de rotas      | 3 pts      | ⏳ To Do | -           |
| US-012 | Sidebar de navegação   | 5 pts      | ⏳ To Do | -           |
| US-013 | Header com perfil      | 3 pts      | ⏳ To Do | -           |
| US-014 | Tema dark/light        | 2 pts      | ⏳ To Do | -           |

**Total:** 29 Story Points  
**Capacity:** 30 Story Points

---

## 🛠️ Tarefas Técnicas

### Setup e Infraestrutura

- [x] Criar projeto Supabase
- [ ] Executar migrations SQL (tabelas do banco)
- [ ] Configurar Supabase Auth
- [ ] Configurar variáveis de ambiente
- [ ] Instalar dependências shadcn/ui

### Desenvolvimento

- [ ] Criar cliente Supabase (client/server)
- [ ] Implementar middleware de autenticação
- [ ] Desenvolver páginas de autenticação (login, registro, recuperação)
- [ ] Criar componentes de layout (sidebar, header)
- [ ] Implementar theme provider
- [ ] Desenvolver formulários com validação
- [ ] Criar store de autenticação (Zustand)

### Qualidade

- [ ] Escrever testes unitários
- [ ] Escrever testes de integração
- [ ] Code review de todos os PRs
- [ ] Documentar componentes criados

### Deploy

- [ ] Deploy em staging (Vercel)
- [ ] Configurar variáveis de ambiente em produção
- [ ] Testar fluxo completo em staging

---

## 📝 Definition of Done (Sprint 1)

Uma User Story está completa quando:

- [ ] Código desenvolvido e commitado
- [ ] Segue 100% o CODE_REVIEW_GUIDE.md
- [ ] Code review aprovado (≥1 aprovação)
- [ ] Testes unitários com coverage ≥ 80%
- [ ] Build passa sem erros
- [ ] Deploy em staging
- [ ] Testado manualmente
- [ ] Documentação atualizada
- [ ] PO aceitou

---

## 📅 Daily Scrum

### Segunda - 25/11/2025

**Status:** Sprint iniciada  
**Foco do dia:** Setup Supabase + Instalação shadcn/ui

### Terça - 26/11/2025

**Foco planejado:** Cliente Supabase + Páginas de auth

### Quarta - 27/11/2025

**Foco planejado:** Login + Registro funcionando

### Quinta - 28/11/2025

**Foco planejado:** Proteção de rotas + Middleware

### Sexta - 29/11/2025

**Foco planejado:** Sidebar + Header

---

### Segunda - 02/12/2025

**Foco planejado:** Tema dark/light + Perfis

### Terça - 03/12/2025

**Foco planejado:** Recuperação de senha

### Quarta - 04/12/2025

**Foco planejado:** Testes + Refinamento

### Quinta - 05/12/2025

**Foco planejado:** Testes E2E + Bug fixes

### Sexta - 06/12/2025

**Foco planejado:** Deploy + Preparação Review

---

## 🎯 Métricas da Sprint

| Métrica          | Meta   | Atual | Status          |
| ---------------- | ------ | ----- | --------------- |
| Velocity         | 29 pts | 0 pts | ⏳ Em andamento |
| Sprint Goal      | 100%   | 0%    | ⏳ Em andamento |
| Code Coverage    | ≥80%   | 0%    | ⏳ Pendente     |
| Bugs em Produção | 0      | 0     | ✅ OK           |
| PRs Abertos      | ≤3     | 0     | ✅ OK           |

---

## 🚧 Impedimentos

| #   | Data | Impedimento  | Impacto | Status | Resolução |
| --- | ---- | ------------ | ------- | ------ | --------- |
| -   | -    | Nenhum ainda | -       | -      | -         |

---

## 📊 Burndown Chart

```
Story Points Remaining
30 |●
25 |
20 |
15 |
10 |
 5 |
 0 |________________________
   1  2  3  4  5  6  7  8  9  10 (dias úteis)
```

---

## 🔄 Próximas Ações

**AGORA:**

1. ✅ Criar projeto no Supabase
2. ⏳ Executar migrations SQL
3. ⏳ Configurar .env.local
4. ⏳ Instalar componentes shadcn/ui
5. ⏳ Começar US-001 (Login)

---

**Status da Sprint:** 🟢 No prazo  
**Última atualização:** 25/11/2025 - Início da Sprint
