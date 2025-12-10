import { useQuery } from '@tanstack/react-query';
import type { ConversationWithDetails } from '@/types/conversations';
import type { Message } from '@/types/database';

/**
 * Hook para buscar conversas do usuário
 * 
 * @example
 * const { data: conversations, isLoading } = useConversations()
 */
export function useConversations() {
  return useQuery({
    queryKey: ['conversations'],
    queryFn: async () => {
      const response = await fetch('/api/conversations');

      if (!response.ok) {
        throw new Error('Failed to fetch conversations');
      }

      return response.json() as Promise<ConversationWithDetails[]>;
    },

    // Cache por 2 minutos (conversas mudam mais rápido)
    staleTime: 2 * 60 * 1000,
    gcTime: 30 * 60 * 1000,

    // Refetch ao voltar ao foco
    refetchOnWindowFocus: true,

    // Retry 1x em erro
    retry: 1,
  });
}

/**
 * Hook para buscar mensagens de uma conversa
 * 
 * @example
 * const { data: messages } = useMessages(conversationId)
 */
export function useMessages(conversationId: string) {
  return useQuery({
    queryKey: ['messages', conversationId],
    queryFn: async () => {
      const response = await fetch(
        `/api/messages?conversation_id=${conversationId}`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch messages');
      }

      return response.json() as Promise<Message[]>;
    },

    // Cache por 1 minuto (mensagens chegam constantemente)
    staleTime: 1 * 60 * 1000,
    gcTime: 30 * 60 * 1000,

    // Só executa se houver conversation_id
    enabled: !!conversationId,

    // Refetch ao voltar ao foco
    refetchOnWindowFocus: true,

    // Retry 1x em erro
    retry: 1,
  });
}
