/**
 * Deal Types
 * Tipos TypeScript para negócios (deals)
 */

import type { Database } from './database';

// Base types from database
export type Deal = Database['public']['Tables']['deals']['Row'];
export type DealInsert = Database['public']['Tables']['deals']['Insert'];
export type DealUpdate = Database['public']['Tables']['deals']['Update'];

// Extended types with relations
export interface DealWithRelations extends Deal {
  contact?: {
    id: string;
    name: string;
    email?: string;
  } | null;
  stage?: {
    id: string;
    name: string;
    color: string;
    order: number;
  } | null;
  assigned_to_user?: {
    id: string;
    name: string;
  } | null;
}

// Pipeline stage
export interface PipelineStage {
  id: string;
  name: string;
  color: string;
  order: number;
  deals: DealWithRelations[];
  totalValue: number;
  count: number;
}

// Deal status
export type DealStatus = 'active' | 'won' | 'lost';

// Form types
export interface CreateDealInput {
  title: string;
  contact_id: string;
  stage_id: string;
  value?: number;
  expected_close_date?: string;
  description?: string;
}

export interface UpdateDealInput extends Partial<CreateDealInput> {
  stage_id?: string;
  position?: number;
}

export interface CloseDealInput {
  status: 'won' | 'lost';
}
