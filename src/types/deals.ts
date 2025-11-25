// Tipos específicos para o módulo de negócios (CRM)

import type { Contact, Deal, DealStage, User } from './database';

// Deal com dados relacionados (join)
export interface DealWithDetails extends Deal {
  contact: Contact;
  stage: DealStage;
  assigned_user: User | null;
}

// Input para criar novo deal
export interface CreateDealInput {
  title: string;
  contact_id: string;
  stage_id: string;
  value: number;
  expected_close_date?: string;
  assigned_to?: string;
}

// Input para atualizar deal
export interface UpdateDealInput {
  title?: string;
  stage_id?: string;
  value?: number;
  expected_close_date?: string;
  assigned_to?: string;
  position?: number;
  status?: 'active' | 'won' | 'lost';
}

// Estrutura do Kanban (colunas e cards)
export interface KanbanColumn {
  stage: DealStage;
  deals: DealWithDetails[];
}

// Evento de drag and drop
export interface DealDragEvent {
  deal_id: string;
  source_stage_id: string;
  destination_stage_id: string;
  new_position: number;
}

// Métricas do pipeline
export interface PipelineMetrics {
  total_deals: number;
  total_value: number;
  won_deals: number;
  won_value: number;
  lost_deals: number;
  conversion_rate: number;
}
