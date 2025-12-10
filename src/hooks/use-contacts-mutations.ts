import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { Contact } from '@/types/contact';
import type { ContactFormData } from '@/lib/validations/contact';

/**
 * Hook para criar novo contato
 * 
 * Automaticamente invalida cache de contatos após sucesso
 * 
 * @example
 * const createMutation = useCreateContact();
 * await createMutation.mutateAsync({ name: 'João' })
 */
export function useCreateContact() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: ContactFormData) => {
      const response = await fetch('/api/contacts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create contact');
      }

      return response.json() as Promise<Contact>;
    },

    // Invalidar cache de contatos após sucesso
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
    },

    retry: 1,
  });
}

/**
 * Hook para editar contato
 * 
 * @example
 * const updateMutation = useUpdateContact(contactId);
 * await updateMutation.mutateAsync({ name: 'Novo Nome' })
 */
export function useUpdateContact(contactId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Partial<ContactFormData>) => {
      const response = await fetch(`/api/contacts/${contactId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update contact');
      }

      return response.json() as Promise<Contact>;
    },

    // Invalidar caches relevantes
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
      queryClient.invalidateQueries({ queryKey: ['contact', contactId] });
    },

    retry: 1,
  });
}

/**
 * Hook para deletar contato
 * 
 * @example
 * const deleteMutation = useDeleteContact();
 * await deleteMutation.mutateAsync(contactId)
 */
export function useDeleteContact() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (contactId: string) => {
      const response = await fetch(`/api/contacts/${contactId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete contact');
      }

      return response.json();
    },

    // Invalidar caches
    onSuccess: (_data, contactId) => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
      queryClient.removeQueries({ queryKey: ['contact', contactId] });
    },

    retry: 0, // Não retry deletes
  });
}

/**
 * Hook para adicionar tags ao contato
 * 
 * @example
 * const tagMutation = useAddContactTag();
 * await tagMutation.mutateAsync({ contactId, tag: 'VIP' })
 */
export function useAddContactTag() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ contactId, tag }: { contactId: string; tag: string }) => {
      const response = await fetch(`/api/contacts/${contactId}/tags`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tag }),
      });

      if (!response.ok) {
        throw new Error('Failed to add tag');
      }

      return response.json() as Promise<Contact>;
    },

    onSuccess: (_data, { contactId }) => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
      queryClient.invalidateQueries({ queryKey: ['contact', contactId] });
    },

    retry: 1,
  });
}
