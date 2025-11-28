// ============================================
// Tipos para Sistema de Tarefas
// Sprint 3 - US-028
// ============================================

import { z } from 'zod';

// ============================================
// Enums e Tipos Base
// ============================================

export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled';

export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

// ============================================
// Interface Principal
// ============================================

export interface Task {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  deal_id?: string;
  contact_id?: string;
  status: TaskStatus;
  priority: TaskPriority;
  due_date?: string;
  completed_at?: string;
  assigned_to?: string;
  reminder_sent: boolean;
  reminder_at?: string;
  created_at: string;
  updated_at: string;
}

// ============================================
// Zod Schemas
// ============================================

export const taskStatusSchema = z.enum(['pending', 'in_progress', 'completed', 'cancelled']);

export const taskPrioritySchema = z.enum(['low', 'medium', 'high', 'urgent']);

export const createTaskSchema = z.object({
  title: z
    .string()
    .min(3, 'Título deve ter pelo menos 3 caracteres')
    .max(200, 'Título não pode ter mais de 200 caracteres'),
  description: z.string().max(2000, 'Descrição não pode ter mais de 2000 caracteres').optional(),
  deal_id: z.string().uuid().optional(),
  contact_id: z.string().uuid().optional(),
  status: taskStatusSchema.default('pending'),
  priority: taskPrioritySchema.default('medium'),
  due_date: z.string().optional().nullable(),
  assigned_to: z.string().uuid().optional(),
  reminder_at: z.string().optional().nullable(),
});

export const updateTaskSchema = createTaskSchema.partial();

export const taskFilterSchema = z.object({
  status: taskStatusSchema.optional(),
  priority: taskPrioritySchema.optional(),
  assigned_to: z.string().uuid().optional(),
  deal_id: z.string().uuid().optional(),
  contact_id: z.string().uuid().optional(),
  overdue: z.boolean().optional(),
  due_today: z.boolean().optional(),
  search: z.string().optional(),
  limit: z.number().int().min(1).max(100).default(20),
  offset: z.number().int().min(0).default(0),
});

// Inferred types from schemas
export type CreateTaskPayload = z.infer<typeof createTaskSchema> & { user_id: string };
export type UpdateTaskPayload = z.infer<typeof updateTaskSchema>;
export type TaskFilters = z.infer<typeof taskFilterSchema>;

// ============================================
// Response Types
// ============================================

export interface TasksResponse {
  tasks: Task[];
  total: number;
  has_more: boolean;
}

export interface TaskStatsResponse {
  total: number;
  by_status: Record<TaskStatus, number>;
  by_priority: Record<TaskPriority, number>;
  overdue: number;
  due_today: number;
  due_this_week: number;
}

// ============================================
// Helper Types
// ============================================

export interface TaskWithRelations extends Task {
  deal_title?: string;
  contact_name?: string;
  assigned_to_email?: string;
}

// ============================================
// Constantes
// ============================================

export const TASK_STATUS_LABELS: Record<TaskStatus, string> = {
  pending: 'Pendente',
  in_progress: 'Em Progresso',
  completed: 'Concluída',
  cancelled: 'Cancelada',
};

export const TASK_PRIORITY_LABELS: Record<TaskPriority, string> = {
  low: 'Baixa',
  medium: 'Média',
  high: 'Alta',
  urgent: 'Urgente',
};

export const TASK_STATUS_COLORS: Record<TaskStatus, string> = {
  pending: 'text-yellow-600 bg-yellow-100',
  in_progress: 'text-blue-600 bg-blue-100',
  completed: 'text-green-600 bg-green-100',
  cancelled: 'text-gray-600 bg-gray-100',
};

export const TASK_PRIORITY_COLORS: Record<TaskPriority, string> = {
  low: 'text-gray-600 bg-gray-100',
  medium: 'text-blue-600 bg-blue-100',
  high: 'text-orange-600 bg-orange-100',
  urgent: 'text-red-600 bg-red-100',
};

// ============================================
// Type Guards
// ============================================

export function isOverdueTask(task: Task): boolean {
  if (!task.due_date) return false;
  if (task.status === 'completed' || task.status === 'cancelled') return false;
  return new Date(task.due_date) < new Date();
}

export function isDueTodayTask(task: Task): boolean {
  if (!task.due_date) return false;
  const today = new Date();
  const dueDate = new Date(task.due_date);
  return (
    dueDate.getDate() === today.getDate() &&
    dueDate.getMonth() === today.getMonth() &&
    dueDate.getFullYear() === today.getFullYear()
  );
}

export function isDueThisWeekTask(task: Task): boolean {
  if (!task.due_date) return false;
  const now = new Date();
  const dueDate = new Date(task.due_date);
  const oneWeek = 7 * 24 * 60 * 60 * 1000;
  return dueDate.getTime() - now.getTime() <= oneWeek && dueDate >= now;
}

// ============================================
// Formatters
// ============================================

export function formatDueDate(dueDate: string): string {
  const date = new Date(dueDate);
  const now = new Date();
  const diffMs = date.getTime() - now.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    const absDays = Math.abs(diffDays);
    return `Venceu há ${absDays} dia${absDays !== 1 ? 's' : ''}`;
  }
  if (diffDays === 0) return 'Vence hoje';
  if (diffDays === 1) return 'Vence amanhã';
  if (diffDays <= 7) return `Vence em ${diffDays} dias`;

  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

export function getTaskStatusLabel(status: TaskStatus): string {
  return TASK_STATUS_LABELS[status];
}

export function getTaskPriorityLabel(priority: TaskPriority): string {
  return TASK_PRIORITY_LABELS[priority];
}

export function getStatusColor(status: TaskStatus): string {
  return TASK_STATUS_COLORS[status];
}

export function getPriorityColor(priority: TaskPriority): string {
  return TASK_PRIORITY_COLORS[priority];
}

export function isOverdue(task: Task): boolean {
  return isOverdueTask(task);
}
