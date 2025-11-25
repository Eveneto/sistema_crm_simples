// Tipos específicos para o módulo de conversas

import type { Contact, Conversation, Message } from './database';

// Conversation com dados relacionados (join)
export interface ConversationWithDetails extends Conversation {
  contact: Contact;
  last_message: Message | null;
}

// Input para criar nova mensagem
export interface CreateMessageInput {
  conversation_id: string;
  sender_type: 'user' | 'contact';
  sender_id: string;
  content: string;
  media_url?: string;
  message_type: 'text' | 'image' | 'video' | 'audio' | 'document';
}

// Filtros para lista de conversas
export interface ConversationFilters {
  status?: 'open' | 'closed' | 'pending' | 'all';
  assigned_to?: string;
  search?: string;
}

// Evento de mensagem em tempo real (Supabase Realtime)
export interface MessageRealtimeEvent {
  type: 'INSERT' | 'UPDATE' | 'DELETE';
  payload: Message;
}
