import { z } from 'zod';

/**
 * Schema para criar uma nova mensagem
 * Valida o conteúdo e a conversa
 */
export const createMessageSchema = z.object({
  conversation_id: z.string().uuid('ID de conversa inválido'),
  content: z
    .string()
    .min(1, 'Mensagem não pode ser vazia')
    .max(5000, 'Mensagem não pode ter mais de 5000 caracteres')
    .trim()
});

export type CreateMessageInput = z.infer<typeof createMessageSchema>;

/**
 * Schema para filtros de conversa
 * Usado na listagem e busca de conversas
 */
export const conversationFiltersSchema = z.object({
  status: z.enum(['open', 'closed', 'pending', 'all']).optional(),
  search: z.string().optional(),
  limit: z.number().int().positive().default(50),
  offset: z.number().int().nonnegative().default(0)
});

export type ConversationFilters = z.infer<typeof conversationFiltersSchema>;
