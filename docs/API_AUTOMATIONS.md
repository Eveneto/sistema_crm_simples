# 📡 APIs de Automação - Documentação

**Sprint 3 - US-026**  
**Status:** ✅ Implementadas

---

## 📋 Visão Geral

As APIs de automação permitem criar, gerenciar e executar regras automatizadas no CRM. O sistema processa automações a cada 5 minutos através de um Cron Job no Vercel.

---

## 🔐 Autenticação

Todas as APIs (exceto o Cron Job) requerem autenticação via Supabase Auth. O Cron Job utiliza um secret header.

```typescript
// Headers para APIs normais
Authorization: Bearer<supabase_token>;

// Header para Cron Job
Authorization: Bearer<CRON_SECRET>;
```

---

## 📡 Endpoints

### 1. Listar Automações

**GET** `/api/automations`

Lista todas as regras de automação do usuário autenticado.

**Query Parameters:**

| Parâmetro      | Tipo    | Padrão | Descrição                       |
| -------------- | ------- | ------ | ------------------------------- |
| `page`         | number  | 1      | Número da página                |
| `limit`        | number  | 20     | Itens por página                |
| `is_active`    | boolean | -      | Filtrar por status (true/false) |
| `trigger_type` | string  | -      | Filtrar por tipo de gatilho     |

**Exemplo:**

```bash
GET /api/automations?page=1&limit=20&is_active=true
```

**Resposta (200):**

```json
{
  "automations": [
    {
      "id": "uuid",
      "user_id": "uuid",
      "name": "Mover negócio após 7 dias",
      "description": "Move automaticamente...",
      "is_active": true,
      "trigger_type": "time_based",
      "trigger_conditions": {
        "days_inactive": 7
      },
      "actions": [
        {
          "type": "move_stage",
          "target_stage": "negociacao"
        }
      ],
      "created_at": "2024-11-28T10:00:00Z",
      "updated_at": "2024-11-28T10:00:00Z",
      "last_executed_at": "2024-11-28T14:00:00Z"
    }
  ],
  "total": 1,
  "page": 1,
  "limit": 20
}
```

---

### 2. Criar Automação

**POST** `/api/automations`

Cria uma nova regra de automação.

**Body:**

```json
{
  "name": "Mover negócio após 7 dias",
  "description": "Descrição opcional",
  "is_active": true,
  "trigger_type": "time_based",
  "trigger_conditions": {
    "days_inactive": 7
  },
  "actions": [
    {
      "type": "move_stage",
      "target_stage": "negociacao"
    },
    {
      "type": "create_task",
      "task_title": "Follow-up necessário",
      "task_description": "Negócio parado há 7 dias",
      "task_due_days": 1
    }
  ]
}
```

**Validação:**

- `name`: string, 3-100 caracteres (obrigatório)
- `description`: string, max 500 caracteres (opcional)
- `is_active`: boolean (padrão: true)
- `trigger_type`: enum (obrigatório)
- `trigger_conditions`: objeto (obrigatório)
- `actions`: array, 1-10 ações (obrigatório)

**Resposta (201):**

```json
{
  "automation": { ... },
  "message": "Automação criada com sucesso"
}
```

**Erros:**

- `401`: Não autorizado
- `400`: Dados inválidos (retorna detalhes dos erros)
- `500`: Erro no servidor

---

### 3. Detalhes da Automação

**GET** `/api/automations/[id]`

Retorna detalhes de uma automação específica.

**Resposta (200):**

```json
{
  "automation": { ... }
}
```

**Erros:**

- `401`: Não autorizado
- `404`: Automação não encontrada
- `500`: Erro no servidor

---

### 4. Atualizar Automação

**PATCH** `/api/automations/[id]`

Atualiza uma automação existente. Todos os campos são opcionais.

**Body:**

```json
{
  "name": "Novo nome",
  "is_active": false,
  "actions": [...]
}
```

**Resposta (200):**

```json
{
  "automation": { ... },
  "message": "Automação atualizada com sucesso"
}
```

---

### 5. Deletar Automação

**DELETE** `/api/automations/[id]`

Remove uma automação (e seus logs em cascade).

**Resposta (200):**

```json
{
  "message": "Automação deletada com sucesso"
}
```

---

### 6. Ativar/Desativar Automação

**POST** `/api/automations/[id]/toggle`

Alterna o status da automação (ativa ↔ inativa).

**Resposta (200):**

```json
{
  "automation": { ... },
  "message": "Automação ativada com sucesso"
}
```

---

### 7. Listar Logs

**GET** `/api/automations/logs`

Lista logs de execução das automações.

**Query Parameters:**

| Parâmetro            | Tipo   | Padrão | Descrição                                  |
| -------------------- | ------ | ------ | ------------------------------------------ |
| `page`               | number | 1      | Número da página                           |
| `limit`              | number | 50     | Itens por página                           |
| `automation_rule_id` | uuid   | -      | Filtrar por regra específica               |
| `status`             | string | -      | Filtrar por status (success/error/skipped) |

**Exemplo:**

```bash
GET /api/automations/logs?automation_rule_id=uuid&status=success
```

**Resposta (200):**

```json
{
  "logs": [
    {
      "id": "uuid",
      "automation_rule_id": "uuid",
      "deal_id": "uuid",
      "executed_at": "2024-11-28T14:00:00Z",
      "status": "success",
      "actions_performed": [
        {
          "type": "move_stage",
          "target_stage": "negociacao"
        }
      ],
      "error_message": null,
      "user_id": "uuid"
    }
  ],
  "total": 1,
  "page": 1,
  "limit": 50
}
```

---

### 8. Processar Automações (Cron Job)

**GET** `/api/cron/process-automations`

⚠️ **Apenas para uso interno do Vercel Cron**

Executa todas as automações ativas. Roda automaticamente a cada 5 minutos.

**Headers:**

```
Authorization: Bearer <CRON_SECRET>
```

**Resposta (200):**

```json
{
  "processed": 5,
  "actionsExecuted": 12,
  "errors": 0,
  "timestamp": "2024-11-28T14:00:00Z"
}
```

---

## 🎯 Tipos de Gatilhos (Triggers)

### time_based

Baseado em tempo de inatividade.

**Condições:**

```typescript
{
  days_inactive?: number;    // Dias sem atividade
  hours_inactive?: number;   // Horas sem atividade
}
```

**Exemplo:**

```json
{
  "trigger_type": "time_based",
  "trigger_conditions": {
    "days_inactive": 7
  }
}
```

### status_change (Futuro)

Dispara quando status muda.

**Condições:**

```typescript
{
  from_status?: string;
  to_status?: string;
}
```

### tag_added (Futuro)

Dispara quando tag é adicionada.

**Condições:**

```typescript
{
  tag?: string;
}
```

### value_threshold (Futuro)

Dispara quando valor atinge limite.

**Condições:**

```typescript
{
  min_value?: number;
  max_value?: number;
}
```

---

## ⚡ Tipos de Ações

### move_stage ✅

Move negócio para outro estágio.

```json
{
  "type": "move_stage",
  "target_stage": "negociacao"
}
```

### send_notification ⏳

Envia notificação (US-027).

```json
{
  "type": "send_notification",
  "notification_message": "Negócio movido automaticamente"
}
```

### create_task ⏳

Cria tarefa (US-028).

```json
{
  "type": "create_task",
  "task_title": "Follow-up",
  "task_description": "Descrição",
  "task_due_days": 1
}
```

### add_tag ✅

Adiciona tag ao negócio.

```json
{
  "type": "add_tag",
  "tag": "follow-up"
}
```

### send_email ⏳

Envia email (Futuro).

```json
{
  "type": "send_email",
  "email_template": "template-id"
}
```

---

## 🧪 Exemplos de Uso

### Criar Automação Simples

```typescript
const response = await fetch('/api/automations', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    name: 'Mover negócio após 7 dias',
    trigger_type: 'time_based',
    trigger_conditions: { days_inactive: 7 },
    actions: [{ type: 'move_stage', target_stage: 'negociacao' }],
  }),
});

const data = await response.json();
console.log(data.automation);
```

### Listar Automações Ativas

```typescript
const response = await fetch('/api/automations?is_active=true');
const data = await response.json();

data.automations.forEach((automation) => {
  console.log(automation.name);
});
```

### Desativar Automação

```typescript
const response = await fetch('/api/automations/[id]/toggle', {
  method: 'POST',
});

const data = await response.json();
console.log(data.message); // "Automação desativada com sucesso"
```

---

## 🔄 Fluxo de Processamento

```
1. Vercel Cron executa a cada 5 minutos
   ↓
2. GET /api/cron/process-automations
   ↓
3. Buscar regras ativas (is_active = true)
   ↓
4. Para cada regra:
   a. Encontrar negócios que atendem condições
   b. Executar ações para cada negócio
   c. Registrar logs de execução
   ↓
5. Atualizar last_executed_at das regras
   ↓
6. Retornar estatísticas
```

---

## 🔒 Segurança

### Row Level Security (RLS)

Todas as tabelas têm RLS habilitado:

- Usuários só veem suas próprias regras
- Usuários só podem criar/editar/deletar suas próprias regras
- Logs só são visíveis para o dono da regra

### Cron Job Protection

O Cron Job requer um secret:

```env
CRON_SECRET=your-secret-here
```

---

## 📊 Monitoramento

### Logs de Execução

Todos os logs ficam em `automation_logs`:

- ✅ **success**: Ação executada com sucesso
- ❌ **error**: Erro na execução
- ⏭️ **skipped**: Ação pulada

### View de Estatísticas

```sql
SELECT * FROM v_automation_rules_stats;
```

Retorna:

- Total de execuções
- Execuções bem-sucedidas
- Execuções com erro

---

## 🧪 Testes

```bash
# Rodar testes unitários
npm test -- automations

# Rodar teste específico
npm test -- automations/__tests__/route.test.ts
```

---

## 📝 Variáveis de Ambiente

```env
# .env.local
CRON_SECRET=your-secret-here
```

---

## 🚀 Deploy

O Cron Job é configurado automaticamente no Vercel via `vercel.json`:

```json
{
  "crons": [
    {
      "path": "/api/cron/process-automations",
      "schedule": "*/5 * * * *"
    }
  ]
}
```

---

## 📚 Referências

- [Documentação US-026](./US-026_FUNIL_AUTOMATIZADO.md)
- [Tipos TypeScript](../src/types/automation.ts)
- [Schema do Banco](../supabase/migrations/20241128_automation_rules.sql)
- [Vercel Cron Jobs](https://vercel.com/docs/cron-jobs)

---

**Atualizado:** 28/11/2024  
**Versão:** 1.0.0  
**Status:** ✅ Pronto para uso
