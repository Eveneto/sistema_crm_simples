// ============================================
// Tipos para Sistema de Automações
// Sprint 3 - US-026
// ============================================

import { z } from 'zod';

// ============================================
// Enums e Tipos Base
// ============================================

export type TriggerType =
  | 'time_based' // Baseado em tempo (dias/horas sem atividade)
  | 'status_change' // Mudança de status do negócio
  | 'tag_added' // Tag adicionada ao negócio/contato
  | 'value_threshold' // Valor do negócio atinge threshold
  | 'stage_entered'; // Negócio entra em determinado estágio

export type ActionType =
  | 'move_stage' // Mover negócio para outro estágio
  | 'send_notification' // Enviar notificação ao usuário
  | 'create_task' // Criar tarefa
  | 'send_email' // Enviar email (futuro)
  | 'add_tag' // Adicionar tag
  | 'change_priority' // Alterar prioridade do negócio
  | 'archive_deal'; // Arquivar negócio

export type AutomationStatus = 'success' | 'error' | 'skipped';

export type Priority = 'low' | 'medium' | 'high';

// ============================================
// Interfaces de Condições
// ============================================

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

// ============================================
// Interfaces de Ações
// ============================================

export interface AutomationAction {
  type: ActionType;

  // Para move_stage
  target_stage?: string;

  // Para send_notification
  notification_message?: string;

  // Para create_task
  task_title?: string;
  task_description?: string;
  task_due_days?: number;

  // Para send_email (futuro)
  email_template?: string;
  email_recipient?: string;

  // Para add_tag
  tag?: string;

  // Para change_priority
  priority?: Priority;
}

// ============================================
// Interface Principal de Regra
// ============================================

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

// ============================================
// Interface de Log de Execução
// ============================================

export interface AutomationLog {
  id: string;
  automation_rule_id: string;
  deal_id?: string;
  contact_id?: string;

  executed_at: string;
  status: AutomationStatus;
  actions_performed?: AutomationAction[];
  error_message?: string;

  user_id: string;
}

// ============================================
// Interface de Estatísticas (View)
// ============================================

export interface AutomationRuleStats extends AutomationRule {
  total_executions: number;
  successful_executions: number;
  failed_executions: number;
}

// ============================================
// Schemas Zod para Validação
// ============================================

// Schema de condições de trigger
export const triggerConditionsSchema = z
  .object({
    days_inactive: z.number().int().min(1).max(365).optional(),
    hours_inactive: z.number().int().min(1).max(8760).optional(),
    from_status: z.string().min(1).max(50).optional(),
    to_status: z.string().min(1).max(50).optional(),
    tag: z.string().min(1).max(50).optional(),
    min_value: z.number().min(0).optional(),
    max_value: z.number().min(0).optional(),
    stage: z.string().min(1).max(50).optional(),
  })
  .refine((data) => Object.values(data).some((val) => val !== undefined), {
    message: 'Pelo menos uma condição deve ser definida',
  });

// Schema de ação individual
export const automationActionSchema = z
  .object({
    type: z.enum([
      'move_stage',
      'send_notification',
      'create_task',
      'send_email',
      'add_tag',
      'change_priority',
      'archive_deal',
    ]),
    target_stage: z.string().min(1).max(50).optional(),
    notification_message: z.string().min(1).max(500).optional(),
    task_title: z.string().min(1).max(200).optional(),
    task_description: z.string().max(1000).optional(),
    task_due_days: z.number().int().min(1).max(365).optional(),
    email_template: z.string().min(1).max(50).optional(),
    email_recipient: z.string().email().optional(),
    tag: z.string().min(1).max(50).optional(),
    priority: z.enum(['low', 'medium', 'high']).optional(),
  })
  .refine(
    (action) => {
      // Validar campos obrigatórios por tipo de ação
      switch (action.type) {
        case 'move_stage':
          return !!action.target_stage;
        case 'send_notification':
          return !!action.notification_message;
        case 'create_task':
          return !!action.task_title;
        case 'add_tag':
          return !!action.tag;
        case 'change_priority':
          return !!action.priority;
        default:
          return true;
      }
    },
    { message: 'Campos obrigatórios faltando para o tipo de ação' }
  );

// Schema para criar regra de automação
export const createAutomationRuleSchema = z.object({
  name: z
    .string()
    .min(3, 'Nome deve ter pelo menos 3 caracteres')
    .max(100, 'Nome não pode ter mais de 100 caracteres'),

  description: z.string().max(500, 'Descrição não pode ter mais de 500 caracteres').optional(),

  is_active: z.boolean().default(true),

  trigger_type: z.enum([
    'time_based',
    'status_change',
    'tag_added',
    'value_threshold',
    'stage_entered',
  ]),

  trigger_conditions: triggerConditionsSchema,

  actions: z
    .array(automationActionSchema)
    .min(1, 'Pelo menos uma ação deve ser definida')
    .max(10, 'Máximo de 10 ações por regra'),
});

// Schema para atualizar regra (todos os campos opcionais)
export const updateAutomationRuleSchema = createAutomationRuleSchema.partial();

// Schema para toggle (ativar/desativar)
export const toggleAutomationSchema = z.object({
  is_active: z.boolean(),
});

// ============================================
// Type Guards
// ============================================

export function isTimeBasedTrigger(conditions: TriggerConditions): boolean {
  return !!(conditions.days_inactive || conditions.hours_inactive);
}

export function isValueThresholdTrigger(conditions: TriggerConditions): boolean {
  return !!(conditions.min_value !== undefined || conditions.max_value !== undefined);
}

export function isStatusChangeTrigger(conditions: TriggerConditions): boolean {
  return !!(conditions.from_status || conditions.to_status);
}

// ============================================
// Helpers de Validação
// ============================================

/**
 * Valida se uma regra de automação tem campos obrigatórios
 */
export function validateAutomationRule(rule: Partial<AutomationRule>): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!rule.name || rule.name.length < 3) {
    errors.push('Nome é obrigatório e deve ter pelo menos 3 caracteres');
  }

  if (!rule.trigger_type) {
    errors.push('Tipo de gatilho é obrigatório');
  }

  if (!rule.trigger_conditions || Object.keys(rule.trigger_conditions).length === 0) {
    errors.push('Condições do gatilho são obrigatórias');
  }

  if (!rule.actions || rule.actions.length === 0) {
    errors.push('Pelo menos uma ação é obrigatória');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Valida se uma ação tem os campos necessários
 */
export function validateAction(action: AutomationAction): {
  valid: boolean;
  error?: string;
} {
  switch (action.type) {
    case 'move_stage':
      if (!action.target_stage) {
        return { valid: false, error: 'target_stage é obrigatório para move_stage' };
      }
      break;

    case 'send_notification':
      if (!action.notification_message) {
        return { valid: false, error: 'notification_message é obrigatório para send_notification' };
      }
      break;

    case 'create_task':
      if (!action.task_title) {
        return { valid: false, error: 'task_title é obrigatório para create_task' };
      }
      break;

    case 'add_tag':
      if (!action.tag) {
        return { valid: false, error: 'tag é obrigatório para add_tag' };
      }
      break;

    case 'change_priority':
      if (!action.priority) {
        return { valid: false, error: 'priority é obrigatório para change_priority' };
      }
      break;
  }

  return { valid: true };
}

// ============================================
// Constantes e Configurações
// ============================================

export const TRIGGER_TYPE_LABELS: Record<TriggerType, string> = {
  time_based: 'Baseado em tempo',
  status_change: 'Mudança de status',
  tag_added: 'Tag adicionada',
  value_threshold: 'Limite de valor',
  stage_entered: 'Entrada em estágio',
};

export const ACTION_TYPE_LABELS: Record<ActionType, string> = {
  move_stage: 'Mover para estágio',
  send_notification: 'Enviar notificação',
  create_task: 'Criar tarefa',
  send_email: 'Enviar email',
  add_tag: 'Adicionar tag',
  change_priority: 'Alterar prioridade',
  archive_deal: 'Arquivar negócio',
};

export const PRIORITY_LABELS: Record<Priority, string> = {
  low: 'Baixa',
  medium: 'Média',
  high: 'Alta',
};

export const AUTOMATION_STATUS_LABELS: Record<AutomationStatus, string> = {
  success: 'Sucesso',
  error: 'Erro',
  skipped: 'Ignorado',
};

// ============================================
// Tipos para Respostas da API
// ============================================

export interface AutomationRuleResponse {
  automation: AutomationRule;
  message?: string;
}

export interface AutomationRulesListResponse {
  automations: AutomationRule[];
  total: number;
  page: number;
  limit: number;
}

export interface AutomationLogsResponse {
  logs: AutomationLog[];
  total: number;
  page: number;
  limit: number;
}

export interface AutomationStatsResponse {
  rule: AutomationRuleStats;
}

// ============================================
// Tipos para Processador de Automações
// ============================================

export interface ProcessAutomationResult {
  rule_id: string;
  deals_processed: number;
  actions_executed: number;
  errors: number;
  duration_ms: number;
}

export interface AutomationExecutionContext {
  rule: AutomationRule;
  deal?: Record<string, unknown>; // DealWithRelations (será definido depois)
  contact?: Record<string, unknown>; // ContactWithRelations (será definido depois)
  user_id: string;
}

// ============================================
// Export Types
// ============================================

export type {
  TriggerType,
  ActionType,
  AutomationStatus,
  Priority,
  TriggerConditions,
  AutomationAction,
  AutomationRule,
  AutomationLog,
  AutomationRuleStats,
  AutomationRuleResponse,
  AutomationRulesListResponse,
  AutomationLogsResponse,
  AutomationStatsResponse,
  ProcessAutomationResult,
  AutomationExecutionContext,
};
