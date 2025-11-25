# Templates Scrum - CRM Simplificado

Documentos e templates para uso diário no projeto.

---

## 1. Sprint Planning - Template de Reunião

**Sprint:** #X  
**Data:** DD/MM/AAAA  
**Duração:** 4h  
**Participantes:** [Listar]

### Parte 1: O QUE fazer (2h)

#### Sprint Goal

> [Objetivo principal da Sprint em 1 frase]
> Exemplo: "Implementar autenticação completa e layout básico do sistema"

#### User Stories Selecionadas

| ID     | User Story           | Estimativa | Prioridade | Responsável |
| ------ | -------------------- | ---------- | ---------- | ----------- |
| US-001 | Login por e-mail     | 5 pts      | Must Have  | [Nome]      |
| US-002 | Registro de usuários | 3 pts      | Must Have  | [Nome]      |
| ...    | ...                  | ...        | ...        | ...         |

**Total de Story Points:** XX pontos  
**Velocity Média:** YY pontos  
**Capacity Disponível:** ZZ pontos

---

### Parte 2: COMO fazer (2h)

#### User Story: US-XXX

**Tarefas Técnicas:**

- [ ] Criar schema no Supabase (2h) - [Dev 1]
- [ ] Implementar API route (3h) - [Dev 2]
- [ ] Desenvolver componente UI (4h) - [Dev 1]
- [ ] Escrever testes unitários (2h) - [Dev 2]
- [ ] Code review (1h) - [Time]

**Estimativa Total:** 12h

**Dependências:**

- Setup do Supabase deve estar completo
- Componente de formulário do shadcn/ui instalado

**Riscos Identificados:**

- [Listar possíveis bloqueios]

---

## 2. Daily Scrum - Template de Anotações

**Data:** DD/MM/AAAA  
**Horário:** 9h30  
**Duração:** 15 min

### [Nome do Dev 1]

- **Ontem:** Implementei login com Supabase, fiz code review da US-002
- **Hoje:** Vou desenvolver proteção de rotas e começar header
- **Impedimentos:** ❌ Nenhum

### [Nome do Dev 2]

- **Ontem:** Criei schema do banco, configurei RLS policies
- **Hoje:** Vou implementar API de registro e testes
- **Impedimentos:** ⚠️ Preciso de acesso ao Supabase em produção

### [Nome do Dev 3]

- **Ontem:** Desenvolvi sidebar, configurei tema dark/light
- **Hoje:** Vou integrar sidebar com rotas do Next.js
- **Impedimentos:** ❌ Nenhum

### Ações Necessárias

- [ ] SM: Solicitar acesso ao Supabase para Dev 2 (até 10h)

---

## 3. Sprint Review - Template de Demonstração

**Sprint:** #X  
**Data:** DD/MM/AAAA  
**Duração:** 2h  
**Participantes:** [PO, SM, Dev Team, Stakeholders]

### 1. Visão Geral da Sprint (10 min)

**Sprint Goal:** [Objetivo]  
**Story Points Committed:** XX  
**Story Points Completed:** YY  
**Velocity:** YY pontos

### 2. Demonstração das User Stories (60 min)

#### ✅ US-001: Login por e-mail/senha (COMPLETA)

**Critérios de Aceitação:**

- [x] Usuário pode fazer login com e-mail/senha
- [x] Mensagem de erro exibida se credenciais inválidas
- [x] Redirecionamento para dashboard após login
- [x] Token JWT salvo no cookie

**Demonstração:**

1. [Dev X] mostrou tela de login
2. Login com credenciais válidas → sucesso
3. Login com senha errada → erro exibido
4. Verificou cookie no DevTools

**Feedback dos Stakeholders:**

- ✅ Aprovado
- 💡 Sugestão: Adicionar opção "Lembrar-me"

---

#### ✅ US-002: Registro de usuários (COMPLETA)

**Demonstração:**
[Descrever]

**Feedback:**
[Feedback]

---

#### ⚠️ US-003: Recuperação de senha (PARCIAL)

**Status:** 80% completa  
**Motivo:** Bug no envio de e-mail de recuperação  
**Ação:** Mover para próxima Sprint

---

### 3. Revisão do Product Backlog (30 min)

**Mudanças de Prioridade:**

- US-015 (Gráfico de funil) movido para Sprint 3 (antes estava na Sprint 5)
- Nova US-070: Exportar relatório PDF (prioridade Should Have)

**Épicos Adicionados:**

- Epic 9: Integrações Externas (Zapier, Make)

### 4. Métricas da Sprint (10 min)

| Métrica          | Meta   | Real   | Status     |
| ---------------- | ------ | ------ | ---------- |
| Velocity         | 30 pts | 28 pts | 🟡 Abaixo  |
| Sprint Goal      | 100%   | 90%    | 🟡 Parcial |
| Code Coverage    | ≥80%   | 85%    | ✅ OK      |
| Bugs em Produção | 0      | 1      | 🟡 Atenção |

### 5. Próximos Passos (20 min)

**Sprint #2 Preview:**

- Foco em Dashboard + Contatos
- Story Points planejados: 32
- Dependências: Nenhuma

---

## 4. Sprint Retrospective - Template

**Sprint:** #X  
**Data:** DD/MM/AAAA  
**Duração:** 1h30  
**Facilitador:** [Scrum Master]

### Formato: Start-Stop-Continue

#### ✅ START (O que devemos COMEÇAR a fazer?)

1. **Pair Programming em tarefas complexas**
   - Proposto por: [Dev 2]
   - Justificativa: Reduzir bugs e compartilhar conhecimento
   - **Ação:** Agendar 2h/semana de pair programming
   - **Responsável:** SM
   - **Prazo:** Próxima Sprint

2. **Code review assíncrono com prazo de 24h**
   - Proposto por: [Dev 1]
   - Justificativa: PRs ficando muito tempo abertos
   - **Ação:** Definir SLA de 24h para review
   - **Responsável:** Time

---

#### ❌ STOP (O que devemos PARAR de fazer?)

1. **Commits direto na develop sem PR**
   - Proposto por: [Dev 3]
   - Justificativa: Quebrou a build 2x
   - **Ação:** Bloquear push direto na develop (GitHub rules)
   - **Responsável:** SM
   - **Prazo:** Hoje

2. **Daily com mais de 15 minutos**
   - Proposto por: [Time]
   - Justificativa: Perdendo foco
   - **Ação:** SM será mais rígido no timebox
   - **Responsável:** SM

---

#### ➡️ CONTINUE (O que está funcionando bem?)

1. **Documentação detalhada no PR**
   - Todos os PRs têm screenshots e descrição clara
   - Facilita o code review

2. **Comunicação no Slack**
   - Canal #crm-dev muito ativo
   - Impedimentos resolvidos rapidamente

3. **Uso do CODE_REVIEW_GUIDE.md**
   - Qualidade do código melhorou significativamente
   - Zero code smells críticos

---

### Gráfico de Felicidade

Escala de 1 a 5 (1 = 😢, 5 = 😄)

| Membro | Sprint Anterior | Esta Sprint | Tendência |
| ------ | --------------- | ----------- | --------- |
| Dev 1  | 4               | 5           | ⬆️        |
| Dev 2  | 3               | 4           | ⬆️        |
| Dev 3  | 5               | 4           | ⬇️        |
| SM     | 4               | 4           | ➡️        |

**Média:** 4.25 (🟢 Boa)

---

### Plano de Ação

| #   | Ação                            | Responsável | Prazo | Status      |
| --- | ------------------------------- | ----------- | ----- | ----------- |
| 1   | Bloquear push direto na develop | SM          | 25/11 | ⏳ Pendente |
| 2   | Agendar pair programming        | SM          | 26/11 | ⏳ Pendente |
| 3   | Definir SLA de code review      | Time        | 26/11 | ⏳ Pendente |

---

## 5. Burndown Chart - Template

### Sprint #X Burndown

```
Story Points Remaining
100 |●
 90 | ●
 80 |  ●
 70 |   ●
 60 |    ●●
 50 |      ●
 40 |       ●
 30 |        ●●
 20 |          ●
 10 |           ●
  0 |____________●___
    1 2 3 4 5 6 7 8 9 10 (dias)

● = Real
--- = Ideal
```

**Análise:**

- Sprint começou bem (Dias 1-3)
- Bloqueio nos dias 4-5 (problema com Supabase)
- Recuperação nos dias 6-8
- Sprint concluída com 28/30 pontos

---

## 6. Definition of Ready (DoR) - Checklist

Use este checklist antes de mover uma User Story para a Sprint:

```markdown
## US-XXX: [Título]

### Definition of Ready

- [ ] Tem título claro e descritivo
- [ ] Segue formato "Como/Eu quero/Para que"
- [ ] Tem critérios de aceitação mensuráveis
- [ ] Foi estimada em Story Points
- [ ] Estimativa é ≤ 13 pontos (senão quebrar)
- [ ] Tem mockups/designs (se for UI)
- [ ] Dependências técnicas identificadas
- [ ] Todo o time entendeu a história
- [ ] PO disponível para esclarecimentos
- [ ] Não há bloqueios técnicos conhecidos

✅ **Ready** | ⏳ **Not Ready**
```

---

## 7. Definition of Done (DoD) - Checklist

Use este checklist antes de marcar uma User Story como completa:

```markdown
## US-XXX: [Título]

### Definition of Done

- [ ] Código desenvolvido e commitado
- [ ] Segue 100% o CODE_REVIEW_GUIDE.md
- [ ] Nomes descritivos (sem abreviações)
- [ ] Funções com ≤ 20 linhas
- [ ] TypeScript strict (sem `any`)
- [ ] Code review aprovado (≥1 aprovação)
- [ ] Testes unitários escritos
- [ ] Coverage ≥ 80% (rodar `npm run test:coverage`)
- [ ] Testes de integração (se aplicável)
- [ ] Build passa sem erros (`npm run build`)
- [ ] Lint passa sem warnings (`npm run lint`)
- [ ] Type check passa (`npm run type-check`)
- [ ] Deploy em staging realizado
- [ ] Testado manualmente em staging
- [ ] Screenshots/vídeo da funcionalidade
- [ ] Documentação atualizada (README, Storybook)
- [ ] PO aceitou a entrega
- [ ] Sem `console.log` ou `debugger`

✅ **Done** | ⏳ **In Progress** | ❌ **Blocked**
```

---

## 8. Impediment Log - Template

Documento vivo para rastrear impedimentos durante a Sprint.

| #   | Data  | Impedimento              | Reportado por | Impacto  | Status          | Resolução           | Resolvido em |
| --- | ----- | ------------------------ | ------------- | -------- | --------------- | ------------------- | ------------ |
| 1   | 26/11 | Supabase fora do ar      | Dev 1         | 🔴 Alto  | ✅ Resolvido    | Supabase voltou     | 26/11 14h    |
| 2   | 27/11 | Evolution API rate limit | Dev 2         | 🟡 Médio | ⏳ Em andamento | Contato com suporte | -            |
| 3   | 28/11 | Falta acesso ao Figma    | Dev 3         | 🟢 Baixo | ✅ Resolvido    | PO deu acesso       | 28/11 10h    |

---

## 9. Risk Register - Template

| #   | Risco                            | Probabilidade | Impacto  | Score | Mitigação                          | Responsável | Status         |
| --- | -------------------------------- | ------------- | -------- | ----- | ---------------------------------- | ----------- | -------------- |
| R1  | Evolution API instável           | 🟡 Média      | 🔴 Alto  | 6     | Testar integração cedo na Sprint 3 | Dev 2       | ⏳ Monitorando |
| R2  | Dev sênior de férias na Sprint 4 | 🟢 Baixa      | 🟡 Médio | 2     | Pair programming antes das férias  | SM          | ✅ Mitigado    |
| R3  | Mudança de escopo pelo cliente   | 🔴 Alta       | 🟡 Médio | 6     | PO firme nas prioridades           | PO          | ⏳ Ativo       |

**Score:** Probabilidade × Impacto (1=Baixo, 2=Médio, 3=Alto)

---

## 10. Velocity Chart - Template

| Sprint | Committed | Completed | Velocity | Tendência   |
| ------ | --------- | --------- | -------- | ----------- |
| 1      | 30        | 28        | 28       | 📊 Baseline |
| 2      | 32        | 30        | 30       | ⬆️ +2       |
| 3      | 35        | 32        | 32       | ⬆️ +2       |
| 4      | 35        | 35        | 35       | ⬆️ +3       |
| 5      | 35        | 33        | 33       | ⬇️ -2       |
| 6      | 30        | 30        | 30       | ⬇️ -3       |

**Velocity Média:** 31.3 pontos/sprint  
**Tendência:** Estável

---

## 11. Technical Debt Log

Registre dívidas técnicas para priorização futura.

| #   | Descrição                                   | Severidade | Esforço | Sprint Criada | Sprint Planejada | Status       |
| --- | ------------------------------------------- | ---------- | ------- | ------------- | ---------------- | ------------ |
| TD1 | Refatorar componente Chat (> 300 linhas)    | 🟡 Médio   | 8 pts   | Sprint 3      | Sprint 7         | ⏳ Backlog   |
| TD2 | Adicionar índices no banco (queries lentas) | 🔴 Alto    | 3 pts   | Sprint 4      | Sprint 5         | ⏳ Planejado |
| TD3 | Substituir `any` em tipos Evolution API     | 🟢 Baixo   | 5 pts   | Sprint 3      | TBD              | ⏳ Backlog   |

---

## 12. Knowledge Sharing Session - Template

**Data:** DD/MM/AAAA  
**Duração:** 1h  
**Apresentador:** [Nome]  
**Tema:** [Ex: "Como funciona o Supabase Realtime"]

### Objetivo

[Por que este tema é importante para o time]

### Agenda

1. Introdução (10 min)
2. Demonstração prática (30 min)
3. Q&A (15 min)
4. Exercício hands-on (5 min)

### Recursos

- Slides: [Link]
- Código exemplo: [Link GitHub]
- Documentação: [Link]

### Notas

[Anotações importantes durante a sessão]

### Próximas Sessões

- [Dev 2]: TypeScript Advanced Types (próxima semana)
- [Dev 3]: Performance Optimization no Next.js

---

## 13. Stakeholder Communication - Template

### E-mail Semanal para Stakeholders

**Assunto:** CRM Simplificado - Update Semanal (Semana X)

**Status Geral:** 🟢 No prazo / 🟡 Atenção / 🔴 Atrasado

#### Progresso desta semana

- ✅ Completamos US-001, US-002, US-005
- ⏳ US-003 em andamento (80% completa)
- 📊 28 Story Points entregues

#### Próximos passos (próxima semana)

- Começar Sprint 2: Dashboard + Contatos
- Deploy em staging para testes

#### Riscos/Impedimentos

- ⚠️ Evolution API com instabilidade (mitigando)

#### Demos/Screenshots

[Anexar imagens das features entregues]

**Próxima reunião:** DD/MM às 15h (Sprint Review)

---

## 14. Release Notes - Template

# Release 1.0.0 - MVP

**Data:** 10/02/2026

## ✨ Novas Funcionalidades

### Autenticação

- Login por e-mail e senha
- Registro de novos usuários
- Recuperação de senha
- Perfis de usuário (Admin, Manager, Agent)

### Dashboard

- Cards de KPIs (vendas, conversas, conversão)
- Gráfico de vendas por período
- Lista de negócios recentes

### Contatos

- CRUD completo de contatos
- Busca por nome/telefone/e-mail
- Sistema de tags

### Conversas WhatsApp

- Listagem de conversas
- Chat em tempo real
- Envio e recebimento de mensagens
- Notificações instantâneas
- Atribuição de conversas

### CRM - Pipeline de Vendas

- Kanban visual com drag-and-drop
- Gestão de negócios
- Estágios customizáveis
- Associação com contatos

### Atividades

- Criação de tarefas, ligações, reuniões
- Atribuição a usuários
- Marcação de conclusão

### Canais

- Conexão de números WhatsApp via QR Code
- Gestão de múltiplos canais
- Status de conexão em tempo real

## 🐛 Correções de Bugs

- Nenhum (primeira release)

## 🔧 Melhorias Técnicas

- Cobertura de testes: 87%
- Performance: LCP < 2s
- Acessibilidade: Score 94
- Zero vulnerabilidades críticas

## 📦 Dependências

- Next.js 14.1.0
- Supabase 2.39.0
- React 18.2.0

## 🚀 Como Atualizar

```bash
git pull origin main
npm install
npm run build
```

## 🔗 Links

- [Documentação](https://docs.crm.com)
- [Changelog Completo](https://github.com/Eveneto/sistema_crm_simples/releases)

---

**Desenvolvido com ❤️ pela equipe CRM Simplificado**
