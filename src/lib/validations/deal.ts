/**
 * Deal Validations
 * Schemas Zod para validação de deals
 * 
 * Single Responsibility: Apenas validação
 */

import { z } from 'zod';

/**
 * Schema para criar novo negócio
 */
export const createDealSchema = z.object({
  title: z.string().min(1, 'Título é obrigatório').max(200, 'Título muito longo'),
  contact_id: z.string().uuid('Contato é obrigatório'),
  stage_id: z.string().uuid('Estágio é obrigatório'),
  value: z.number().min(0, 'Valor deve ser positivo').default(0),
  expected_close_date: z.string().optional(),
  description: z.string().max(1000, 'Descrição muito longa').optional(),
});

/**
 * Schema para atualizar negócio
 * Todos os campos são opcionais
 */
export const updateDealSchema = createDealSchema.partial().extend({
  stage_id: z.string().uuid().optional(),
  position: z.number().int().min(0).optional(),
});

/**
 * Schema para fechar negócio (ganho/perdido)
 */
export const closeDealSchema = z.object({
  status: z.enum(['won', 'lost'], {
    message: 'Status deve ser "won" ou "lost"',
  }),
});

/**
 * Schema para mover negócio (drag and drop)
 */
export const moveDealSchema = z.object({
  stage_id: z.string().uuid('Estágio inválido'),
  position: z.number().int().min(0, 'Posição deve ser positiva'),
});

// Export types
export type CreateDealInput = z.infer<typeof createDealSchema>;
export type UpdateDealInput = z.infer<typeof updateDealSchema>;
export type CloseDealInput = z.infer<typeof closeDealSchema>;
export type MoveDealInput = z.infer<typeof moveDealSchema>;
