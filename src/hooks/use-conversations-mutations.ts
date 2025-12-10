import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { Message } from '@/types/database';

/**
 * Hook para enviar mensagem
 * 
 * Automaticamente atualiza cache de mensagens após sucesso
 * 
 * @example
 * const sendMutation = useSendMessage();
 * await sendMutation.mutateAsync({ conversation_id, content })
 */
export function useSendMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      conversation_id,
      content,
    }: {
      conversation_id: string;
      content: string;
    }) => {
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ conversation_id, content }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to send message');
      }

      return response.json() as Promise<Message>;
    },

    // Invalidar cache de mensagens da conversa
    onSuccess: (_data, { conversation_id }) => {
      queryClient.invalidateQueries({
        queryKey: ['messages', conversation_id],
      });
      // Também invalidar conversas para atualizar last_message_at
      queryClient.invalidateQueries({
        queryKey: ['conversations'],
      });
    },

    retry: 1,
  });
}

/**
 * Hook para criar conversa
 * 
 * @example
 * const createMutation = useCreateConversation();
 * await createMutation.mutateAsync({ contact_id, channel_type })
 */
export function useCreateConversation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      contact_id,
      channel_type,
    }: {
      contact_id: string;
      channel_type: string;
    }) => {
      const response = await fetch('/api/conversations/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contact_id, channel_type }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create conversation');
      }

      return response.json();
    },

    // Invalidar cache de conversas
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['conversations'],
      });
    },

    retry: 1,
  });
}

/**
 * Hook para atualizar status da conversa
 * 
 * @example
 * const updateMutation = useUpdateConversationStatus();
 * await updateMutation.mutateAsync({ conversationId, status: 'closed' })
 */
export function useUpdateConversationStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      conversationId,
      status,
    }: {
      conversationId: string;
      status: string;
    }) => {
      const response = await fetch(
        `/api/conversations/${conversationId}/status`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to update conversation status');
      }

      return response.json();
    },

    // Invalidar caches
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['conversations'],
      });
    },

    retry: 1,
  });
}

/**
 * Hook para marcar conversa como lida
 * 
 * @example
 * const readMutation = useMarkConversationAsRead();
 * await readMutation.mutateAsync(conversationId)
 */
export function useMarkConversationAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (conversationId: string) => {
      const response = await fetch(
        `/api/conversations/${conversationId}/read`,
        {
          method: 'PATCH',
        }
      );

      if (!response.ok) {
        throw new Error('Failed to mark as read');
      }

      return response.json();
    },

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['conversations'],
      });
    },

    retry: 0, // Não retry leitura
  });
}
