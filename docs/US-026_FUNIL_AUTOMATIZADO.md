# US-026: Funil de Vendas Automatizado

**Sprint:** 3  
**Pontos:** 5  
**Início:** 28/11/2024  
**Status:** 🟡 Em Desenvolvimento

---

## 📋 Descrição

**Como** usuário  
**Quero** que negócios avancem automaticamente pelo funil  
**Para** reduzir trabalho manual e não perder oportunidades

---

## ✅ Critérios de Aceitação

- [ ] Criar regras de automação com condições e ações
- [ ] Transição automática por tempo (ex: após 7 dias sem atividade)
- [ ] Notificação quando negócio fica parado
- [ ] Ações automáticas (enviar email, alterar status, criar tarefa)
- [ ] Dashboard de automações ativas
- [ ] Ativar/desativar regras
- [ ] Logs de execução de automações

---

## 🏗️ Arquitetura Técnica

### 1. Schema do Banco de Dados

```sql
-- Tabela de regras de automação
CREATE TABLE automation_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,

  -- Condições (trigger)
  trigger_type VARCHAR(50) NOT NULL, -- 'time_based', 'status_change', 'tag_added'
  trigger_conditions JSONB NOT NULL, -- { "days_inactive": 7, "stage": "proposta" }

  -- Ações
  actions JSONB NOT NULL, -- [{ "type": "move_stage", "target_stage": "negociacao" }]

  -- Metadados
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_executed_at TIMESTAMP WITH TIME ZONE
);

-- Índices
CREATE INDEX idx_automation_rules_user_id ON automation_rules(user_id);
CREATE INDEX idx_automation_rules_is_active ON automation_rules(is_active);
CREATE INDEX idx_automation_rules_trigger_type ON automation_rules(trigger_type);

-- RLS Policies
ALTER TABLE automation_rules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own automation rules"
  ON automation_rules FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own automation rules"
  ON automation_rules FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own automation rules"
  ON automation_rules FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own automation rules"
  ON automation_rules FOR DELETE
  USING (auth.uid() = user_id);

-- Tabela de logs de execução
CREATE TABLE automation_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  automation_rule_id UUID NOT NULL REFERENCES automation_rules(id) ON DELETE CASCADE,
  deal_id UUID REFERENCES deals(id) ON DELETE CASCADE,
  contact_id UUID REFERENCES contacts(id) ON DELETE CASCADE,

  executed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status VARCHAR(20) NOT NULL, -- 'success', 'error', 'skipped'
  actions_performed JSONB, -- [{ "type": "move_stage", "from": "proposta", "to": "negociacao" }]
  error_message TEXT,

  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Índices
CREATE INDEX idx_automation_logs_rule_id ON automation_logs(automation_rule_id);
CREATE INDEX idx_automation_logs_deal_id ON automation_logs(deal_id);
CREATE INDEX idx_automation_logs_executed_at ON automation_logs(executed_at);

-- RLS Policies
ALTER TABLE automation_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own automation logs"
  ON automation_logs FOR SELECT
  USING (auth.uid() = user_id);
```

### 2. Tipos TypeScript

```typescript
// src/types/automation.ts

export type TriggerType =
  | 'time_based' // Baseado em tempo (dias sem atividade)
  | 'status_change' // Mudança de status
  | 'tag_added' // Tag adicionada
  | 'value_threshold' // Valor atinge threshold
  | 'stage_entered'; // Negócio entra em estágio

export type ActionType =
  | 'move_stage' // Mover para outro estágio
  | 'send_notification' // Enviar notificação
  | 'create_task' // Criar tarefa
  | 'send_email' // Enviar email (futuro)
  | 'add_tag' // Adicionar tag
  | 'change_priority' // Alterar prioridade
  | 'archive_deal'; // Arquivar negócio

export interface TriggerConditions {
  // Para time_based
  days_inactive?: number;
  hours_inactive?: number;

  // Para status_change
  from_status?: string;
  to_status?: string;

  // Para tag_added
  tag?: string;

  // Para value_threshold
  min_value?: number;
  max_value?: number;

  // Para stage_entered
  stage?: string;
}

export interface AutomationAction {
  type: ActionType;

  // Parâmetros específicos por tipo
  target_stage?: string;
  notification_message?: string;
  task_title?: string;
  task_description?: string;
  task_due_days?: number;
  email_template?: string;
  tag?: string;
  priority?: 'low' | 'medium' | 'high';
}

export interface AutomationRule {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  is_active: boolean;

  trigger_type: TriggerType;
  trigger_conditions: TriggerConditions;
  actions: AutomationAction[];

  created_at: string;
  updated_at: string;
  last_executed_at?: string;
}

export interface AutomationLog {
  id: string;
  automation_rule_id: string;
  deal_id?: string;
  contact_id?: string;

  executed_at: string;
  status: 'success' | 'error' | 'skipped';
  actions_performed?: AutomationAction[];
  error_message?: string;

  user_id: string;
}

// Schemas Zod para validação
import { z } from 'zod';

export const triggerConditionsSchema = z.object({
  days_inactive: z.number().min(1).max(365).optional(),
  hours_inactive: z.number().min(1).max(8760).optional(),
  from_status: z.string().optional(),
  to_status: z.string().optional(),
  tag: z.string().optional(),
  min_value: z.number().min(0).optional(),
  max_value: z.number().min(0).optional(),
  stage: z.string().optional(),
});

export const automationActionSchema = z.object({
  type: z.enum([
    'move_stage',
    'send_notification',
    'create_task',
    'send_email',
    'add_tag',
    'change_priority',
    'archive_deal',
  ]),
  target_stage: z.string().optional(),
  notification_message: z.string().optional(),
  task_title: z.string().optional(),
  task_description: z.string().optional(),
  task_due_days: z.number().min(1).max(365).optional(),
  email_template: z.string().optional(),
  tag: z.string().optional(),
  priority: z.enum(['low', 'medium', 'high']).optional(),
});

export const createAutomationRuleSchema = z.object({
  name: z.string().min(3).max(100),
  description: z.string().max(500).optional(),
  is_active: z.boolean().default(true),
  trigger_type: z.enum([
    'time_based',
    'status_change',
    'tag_added',
    'value_threshold',
    'stage_entered',
  ]),
  trigger_conditions: triggerConditionsSchema,
  actions: z.array(automationActionSchema).min(1).max(10),
});

export const updateAutomationRuleSchema = createAutomationRuleSchema.partial();
```

---

## 🔧 Implementação

### Fase 1: Database Schema ✅

**Tarefas:**

- [ ] Criar migration do Supabase
- [ ] Executar schema no banco
- [ ] Validar RLS policies
- [ ] Criar dados de seed para testes

### Fase 2: API Routes

**Endpoints:**

```typescript
// GET /api/automations - Listar regras do usuário
// POST /api/automations - Criar nova regra
// GET /api/automations/[id] - Detalhes da regra
// PATCH /api/automations/[id] - Atualizar regra
// DELETE /api/automations/[id] - Deletar regra
// POST /api/automations/[id]/toggle - Ativar/desativar
// GET /api/automations/logs - Logs de execução
```

**Tarefas:**

- [ ] Criar `/api/automations/route.ts`
- [ ] Criar `/api/automations/[id]/route.ts`
- [ ] Criar `/api/automations/[id]/toggle/route.ts`
- [ ] Criar `/api/automations/logs/route.ts`
- [ ] Testes unitários dos endpoints

### Fase 3: Processador de Automações

**Vercel Cron Job:**

```typescript
// src/app/api/cron/process-automations/route.ts

export async function GET(request: Request) {
  // Validar authorization header (Vercel Cron Secret)
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // 1. Buscar regras ativas
  const activeRules = await getActiveAutomationRules();

  // 2. Para cada regra, verificar condições
  for (const rule of activeRules) {
    const matchingDeals = await findMatchingDeals(rule);

    // 3. Executar ações para cada negócio que atende condições
    for (const deal of matchingDeals) {
      await executeAutomationActions(rule, deal);
      await logAutomationExecution(rule, deal, 'success');
    }
  }

  return NextResponse.json({ processed: activeRules.length });
}
```

**Tarefas:**

- [ ] Criar `/api/cron/process-automations/route.ts`
- [ ] Configurar `vercel.json` com cron
- [ ] Implementar lógica de matching
- [ ] Implementar executor de ações
- [ ] Testes de integração

### Fase 4: Componentes UI

**Páginas:**

1. `/dashboard/automations` - Lista de regras
2. `/dashboard/automations/new` - Criar regra
3. `/dashboard/automations/[id]` - Editar regra
4. `/dashboard/automations/logs` - Logs de execução

**Componentes:**

```typescript
// src/components/automations/automation-list.tsx
// src/components/automations/automation-form.tsx
// src/components/automations/automation-card.tsx
// src/components/automations/trigger-selector.tsx
// src/components/automations/action-selector.tsx
// src/components/automations/automation-logs.tsx
```

**Tarefas:**

- [ ] Criar página de lista
- [ ] Criar formulário de criação/edição
- [ ] Componente de seleção de trigger
- [ ] Componente de seleção de ações
- [ ] Página de logs
- [ ] Testes de componentes

---

## 🎨 UI/UX Design

### AutomationForm - Fluxo Visual

```
┌─────────────────────────────────────────┐
│ Nova Automação                          │
├─────────────────────────────────────────┤
│                                         │
│ Nome da Regra                           │
│ ┌─────────────────────────────────────┐ │
│ │ Mover negócio após inatividade      │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ Quando (Gatilho)                        │
│ ┌─────────────────────────────────────┐ │
│ │ ⏰ Baseado em tempo ▼              │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ Condições                               │
│ ┌─────────────────────────────────────┐ │
│ │ Negócio está parado há [7] dias     │ │
│ │ No estágio: [Proposta ▼]           │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ Executar Ações                          │
│ ┌─────────────────────────────────────┐ │
│ │ ✓ Mover para: [Negociação ▼]      │ │
│ │ ✓ Criar tarefa: "Follow-up"        │ │
│ │ ✓ Notificar: "Negócio movido"      │ │
│ │                                     │ │
│ │ [+ Adicionar Ação]                  │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ ☑ Regra ativa                          │
│                                         │
│ [Cancelar]  [Salvar Automação]         │
└─────────────────────────────────────────┘
```

---

## 📊 Exemplos de Automações

### 1. Mover negócio parado

```json
{
  "name": "Mover negócio após 7 dias",
  "trigger_type": "time_based",
  "trigger_conditions": {
    "days_inactive": 7,
    "stage": "proposta"
  },
  "actions": [
    {
      "type": "move_stage",
      "target_stage": "negociacao"
    },
    {
      "type": "create_task",
      "task_title": "Follow-up necessário",
      "task_description": "Negócio estava parado há 7 dias",
      "task_due_days": 1
    }
  ]
}
```

### 2. Notificar negócio de alto valor

```json
{
  "name": "Alerta para negócios > R$ 50k",
  "trigger_type": "value_threshold",
  "trigger_conditions": {
    "min_value": 50000
  },
  "actions": [
    {
      "type": "send_notification",
      "notification_message": "🔥 Novo negócio de alto valor criado!"
    },
    {
      "type": "change_priority",
      "priority": "high"
    },
    {
      "type": "add_tag",
      "tag": "alto-valor"
    }
  ]
}
```

### 3. Arquivar negócios antigos

```json
{
  "name": "Arquivar negócios perdidos antigos",
  "trigger_type": "time_based",
  "trigger_conditions": {
    "days_inactive": 90,
    "stage": "perdido"
  },
  "actions": [
    {
      "type": "archive_deal"
    }
  ]
}
```

---

## 🧪 Testes

### Testes Unitários

```typescript
// __tests__/api/automations.test.ts
describe('Automations API', () => {
  it('should create automation rule', async () => {});
  it('should list user automations', async () => {});
  it('should toggle automation active status', async () => {});
  it('should delete automation', async () => {});
});

// __tests__/lib/automation-processor.test.ts
describe('Automation Processor', () => {
  it('should find deals matching time_based rule', async () => {});
  it('should execute move_stage action', async () => {});
  it('should execute create_task action', async () => {});
  it('should log execution', async () => {});
});
```

### Testes de Integração

```typescript
describe('Automation Flow E2E', () => {
  it('should process automation and move deal', async () => {
    // 1. Criar regra
    // 2. Criar negócio que atende condições
    // 3. Executar cron job
    // 4. Verificar se negócio foi movido
    // 5. Verificar log de execução
  });
});
```

---

## 📈 Métricas de Sucesso

- ✅ Criar pelo menos 3 regras de automação
- ✅ 100% das automações executadas com sucesso
- ✅ Logs registrados para auditoria
- ✅ Tempo de resposta < 2s para dashboard
- ✅ Cron job executa em < 30s

---

## 🔄 Próximos Passos

1. ✅ Criar schema do banco
2. 🔄 Implementar API routes
3. ⏳ Criar processador de automações
4. ⏳ Desenvolver UI
5. ⏳ Testes completos

---

**Status:** 🟡 Em Desenvolvimento  
**Início:** 28/11/2024  
**Previsão:** 02/12/2024
