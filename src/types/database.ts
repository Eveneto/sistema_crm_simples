// Tipos base do banco de dados Supabase

export interface Database {
  public: {
    Tables: {
      users: {
        Row: User;
        Insert: Omit<User, 'id' | 'created_at'>;
        Update: Partial<Omit<User, 'id' | 'created_at'>>;
      };
      contacts: {
        Row: Contact;
        Insert: Omit<Contact, 'id' | 'created_at'>;
        Update: Partial<Omit<Contact, 'id' | 'created_at'>>;
      };
      conversations: {
        Row: Conversation;
        Insert: Omit<Conversation, 'id' | 'created_at'>;
        Update: Partial<Omit<Conversation, 'id' | 'created_at'>>;
      };
      messages: {
        Row: Message;
        Insert: Omit<Message, 'id' | 'created_at'>;
        Update: Partial<Omit<Message, 'id' | 'created_at'>>;
      };
      deals: {
        Row: Deal;
        Insert: Omit<Deal, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Deal, 'id' | 'created_at' | 'updated_at'>>;
      };
      deal_stages: {
        Row: DealStage;
        Insert: Omit<DealStage, 'id' | 'created_at'>;
        Update: Partial<Omit<DealStage, 'id' | 'created_at'>>;
      };
      channels: {
        Row: Channel;
        Insert: Omit<Channel, 'id' | 'created_at'>;
        Update: Partial<Omit<Channel, 'id' | 'created_at'>>;
      };
      activities: {
        Row: Activity;
        Insert: Omit<Activity, 'id' | 'created_at'>;
        Update: Partial<Omit<Activity, 'id' | 'created_at'>>;
      };
    };
  };
}

// User
export interface User {
  id: string;
  email: string;
  full_name: string;
  avatar_url: string | null;
  role: UserRole;
  created_at: string;
}

export type UserRole = 'admin' | 'agent' | 'manager';

// Contact
export interface Contact {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  avatar_url: string | null;
  tags: string[];
  custom_fields: Record<string, unknown>;
  created_at: string;
}

// Conversation
export interface Conversation {
  id: string;
  contact_id: string;
  channel_id: string;
  assigned_to: string | null;
  status: ConversationStatus;
  last_message_at: string | null;
  unread_count: number;
  created_at: string;
}

export type ConversationStatus = 'open' | 'closed' | 'pending';

// Message
export interface Message {
  id: string;
  conversation_id: string;
  sender_type: 'user' | 'contact';
  sender_id: string;
  content: string;
  media_url: string | null;
  message_type: MessageType;
  whatsapp_message_id: string | null;
  created_at: string;
}

export type MessageType = 'text' | 'image' | 'video' | 'audio' | 'document';

// Deal
export interface Deal {
  id: string;
  title: string;
  contact_id: string;
  stage_id: string;
  value: number;
  expected_close_date: string | null;
  assigned_to: string | null;
  position: number;
  status: DealStatus;
  created_at: string;
  updated_at: string;
}

export type DealStatus = 'active' | 'won' | 'lost';

// Deal Stage
export interface DealStage {
  id: string;
  name: string;
  color: string;
  position: number;
  created_at: string;
}

// Channel
export interface Channel {
  id: string;
  type: ChannelType;
  name: string;
  phone: string | null;
  is_connected: boolean;
  evolution_instance_id: string | null;
  config: Record<string, unknown>;
  created_at: string;
}

export type ChannelType = 'whatsapp' | 'telegram' | 'webchat';

// Activity
export interface Activity {
  id: string;
  type: ActivityType;
  title: string;
  description: string | null;
  contact_id: string;
  deal_id: string | null;
  assigned_to: string;
  due_date: string | null;
  completed: boolean;
  created_at: string;
}

export type ActivityType = 'call' | 'email' | 'meeting' | 'note' | 'task';
