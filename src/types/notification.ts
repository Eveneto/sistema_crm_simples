// ============================================
// Tipos para Sistema de Notificações
// Sprint 3 - US-027
// ============================================

import { z } from 'zod';

// ============================================
// Enums e Tipos Base
// ============================================

export type NotificationType =
  | 'automation_executed' // Automação executada
  | 'deal_updated' // Negócio atualizado
  | 'task_assigned' // Tarefa atribuída
  | 'task_due' // Tarefa vencendo
  | 'activity_reminder' // Lembrete de atividade
  | 'mention' // Menção em comentário
  | 'system'; // Notificação do sistema

export type EntityType = 'deal' | 'contact' | 'task' | 'activity';

// ============================================
// Interface Principal
// ============================================

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: NotificationType;
  entity_type?: EntityType;
  entity_id?: string;
  link?: string;
  read: boolean;
  read_at?: string;
  created_at: string;
  updated_at: string;
}

// ============================================
// Zod Schemas
// ============================================

export const notificationTypeSchema = z.enum([
  'automation_executed',
  'deal_updated',
  'task_assigned',
  'task_due',
  'activity_reminder',
  'mention',
  'system',
]);

export const entityTypeSchema = z.enum(['deal', 'contact', 'task', 'activity']);

export const createNotificationSchema = z.object({
  user_id: z.string().uuid('ID de usuário inválido'),
  title: z
    .string()
    .min(1, 'Título é obrigatório')
    .max(200, 'Título não pode ter mais de 200 caracteres'),
  message: z.string().min(1, 'Mensagem é obrigatória'),
  type: notificationTypeSchema,
  entity_type: entityTypeSchema.optional(),
  entity_id: z.string().uuid().optional(),
  link: z.string().max(500).optional(),
});

export const updateNotificationSchema = z.object({
  read: z.boolean(),
});

export const markAsReadSchema = z.object({
  notification_ids: z.array(z.string().uuid()).min(1),
});

// ============================================
// Helper Types
// ============================================

export interface NotificationStats {
  total: number;
  unread: number;
  by_type: Record<NotificationType, number>;
}

export interface NotificationFilters {
  read?: boolean;
  type?: NotificationType;
  limit?: number;
  offset?: number;
}

// ============================================
// Response Types
// ============================================

export interface NotificationsResponse {
  notifications: Notification[];
  total: number;
  unread_count: number;
  has_more: boolean;
}

export interface NotificationCreateResponse {
  notification: Notification;
  success: boolean;
}

export interface NotificationUpdateResponse {
  success: boolean;
  updated_count: number;
}

// ============================================
// Helpers e Constantes
// ============================================

export const NOTIFICATION_ICONS: Record<NotificationType, string> = {
  automation_executed: '⚡',
  deal_updated: '💼',
  task_assigned: '✅',
  task_due: '⏰',
  activity_reminder: '📅',
  mention: '👤',
  system: '🔔',
};

export const NOTIFICATION_COLORS: Record<NotificationType, string> = {
  automation_executed: 'text-purple-600',
  deal_updated: 'text-blue-600',
  task_assigned: 'text-green-600',
  task_due: 'text-orange-600',
  activity_reminder: 'text-yellow-600',
  mention: 'text-pink-600',
  system: 'text-gray-600',
};

export const NOTIFICATION_TITLES: Record<NotificationType, string> = {
  automation_executed: 'Automação Executada',
  deal_updated: 'Negócio Atualizado',
  task_assigned: 'Tarefa Atribuída',
  task_due: 'Tarefa Vencendo',
  activity_reminder: 'Lembrete de Atividade',
  mention: 'Você foi mencionado',
  system: 'Notificação do Sistema',
};

// ============================================
// Type Guards
// ============================================

export function isValidNotificationType(type: string): type is NotificationType {
  return [
    'automation_executed',
    'deal_updated',
    'task_assigned',
    'task_due',
    'activity_reminder',
    'mention',
    'system',
  ].includes(type);
}

export function isUnreadNotification(notification: Notification): boolean {
  return !notification.read;
}

// ============================================
// Formatters
// ============================================

export function formatNotificationTime(createdAt: string): string {
  const now = new Date();
  const created = new Date(createdAt);
  const diffMs = now.getTime() - created.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Agora';
  if (diffMins < 60) return `${diffMins}m atrás`;
  if (diffHours < 24) return `${diffHours}h atrás`;
  if (diffDays < 7) return `${diffDays}d atrás`;

  return created.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
  });
}

export function getNotificationIcon(type: NotificationType): string {
  return NOTIFICATION_ICONS[type] || '🔔';
}

export function getNotificationColor(type: NotificationType): string {
  return NOTIFICATION_COLORS[type] || 'text-gray-600';
}
