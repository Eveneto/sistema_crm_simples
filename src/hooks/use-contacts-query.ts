import { useQuery } from '@tanstack/react-query';
import type { Contact } from '@/types/contact';

interface ContactsResponse {
  contacts: Contact[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasPrev: boolean;
    hasNext: boolean;
  };
}

interface UseContactsOptions {
  page?: number;
  search?: string;
  limit?: number;
}

/**
 * Hook para buscar contatos com cache
 * 
 * Usa React Query para:
 * - Cache automático (5 minutos)
 * - Refetch inteligente
 * - Retry automático
 * - Sincronização
 * 
 * @example
 * const { data, isLoading, error } = useContacts({ page: 1, search: 'João' })
 */
export function useContacts(options: UseContactsOptions = {}) {
  const { page = 1, search = '', limit = 50 } = options;

  return useQuery({
    queryKey: ['contacts', page, search, limit],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(limit),
        ...(search && { search }),
      });

      const response = await fetch(`/api/contacts?${params}`);

      if (!response.ok) {
        throw new Error('Failed to fetch contacts');
      }

      return response.json() as Promise<ContactsResponse>;
    },

    // Cache por 5 minutos
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,

    // Refetch ao voltar ao foco
    refetchOnWindowFocus: true,

    // Retry 1x em erro
    retry: 1,
  });
}

/**
 * Hook para buscar um contato específico
 */
export function useContact(id: string) {
  return useQuery({
    queryKey: ['contact', id],
    queryFn: async () => {
      const response = await fetch(`/api/contacts/${id}`);
      if (!response.ok) throw new Error('Failed to fetch contact');
      return response.json() as Promise<Contact>;
    },
    staleTime: 5 * 60 * 1000,
    enabled: !!id, // Só executa se houver ID
  });
}
