// =====================================================
// Tipos do Chat Interno de Equipe
// =====================================================

export type RoomType = 'direct' | 'group';
export type MessageType = 'text' | 'image' | 'file';

// Perfil mínimo de usuário exibido no chat
export interface TeamUserProfile {
  id: string;
  full_name: string;
  avatar_url: string | null;
  role: 'admin' | 'manager' | 'agent';
}

// Sala de chat (DM ou grupo)
export interface TeamRoom {
  id: string;
  type: RoomType;
  name: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
}

// Sala enriquecida com detalhes (view team_rooms_with_details)
export interface TeamRoomWithDetails extends TeamRoom {
  last_message_content: string | null;
  last_message_at: string | null;
  last_message_sender_id: string | null;
  unread_count: number;
  last_read_at: string;
  // Resolvido no frontend
  other_user?: TeamUserProfile;  // para DMs
  members?: TeamUserProfile[];   // para grupos
}

// Membro de uma sala
export interface TeamRoomMember {
  room_id: string;
  user_id: string;
  joined_at: string;
  last_read_at: string;
  user?: TeamUserProfile;
}

// Mensagem do chat interno
export interface TeamMessage {
  id: string;
  room_id: string;
  sender_id: string;
  content: string;
  message_type: MessageType;
  created_at: string;
  // Resolvido no frontend
  sender?: TeamUserProfile;
}

// =====================================================
// Tipos de Request/Response das APIs
// =====================================================

export interface CreateRoomRequest {
  target_user_id: string;  // Para DM: ID do outro usuário
}

export interface SendMessageRequest {
  content: string;
  message_type?: MessageType;
}

export interface RoomsResponse {
  rooms: TeamRoomWithDetails[];
}

export interface MessagesResponse {
  messages: TeamMessage[];
  has_more: boolean;
}

export interface RoomDetailResponse {
  room: TeamRoom;
  members: TeamRoomMember[];
}
