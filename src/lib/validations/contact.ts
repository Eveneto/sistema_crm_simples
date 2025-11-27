import { z } from 'zod';

// Regex para validação de telefone brasileiro
// Aceita: (11) 99999-9999, (11) 9999-9999, 11999999999, etc.
const phoneRegex = /^(\+55\s?)?(\(?\d{2}\)?\s?)?9?\d{4}-?\d{4}$/;

export const contactSchema = z.object({
  name: z
    .string()
    .min(2, 'Nome deve ter no mínimo 2 caracteres')
    .max(100, 'Nome deve ter no máximo 100 caracteres'),

  email: z.string().email('Email inválido').toLowerCase().optional().or(z.literal('')),

  phone: z
    .string()
    .regex(phoneRegex, 'Telefone inválido. Use formato: (11) 99999-9999')
    .optional()
    .or(z.literal('')),

  company: z
    .string()
    .max(100, 'Nome da empresa deve ter no máximo 100 caracteres')
    .optional()
    .or(z.literal('')),

  position: z
    .string()
    .max(100, 'Cargo deve ter no máximo 100 caracteres')
    .optional()
    .or(z.literal('')),

  tags: z.array(z.string()).optional().default([]),

  notes: z
    .string()
    .max(500, 'Notas devem ter no máximo 500 caracteres')
    .optional()
    .or(z.literal('')),
});

export type ContactFormData = z.infer<typeof contactSchema>;

// Schema para criação (garante que pelo menos email OU telefone existe)
export const createContactSchema = contactSchema.refine((data) => data.email || data.phone, {
  message: 'Pelo menos email ou telefone deve ser fornecido',
  path: ['email'],
});

// Schema para atualização (todos os campos são opcionais)
export const updateContactSchema = contactSchema.partial();
