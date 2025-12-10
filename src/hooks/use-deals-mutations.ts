import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { DealWithRelations } from '@/types/deal';

interface DealFormData {
  name: string;
  contact_id: string;
  stage_id: string;
  value: number;
  probability: number;
  description?: string;
}

/**
 * Hook para criar novo deal
 * 
 * @example
 * const createMutation = useCreateDeal();
 * await createMutation.mutateAsync(dealData)
 */
export function useCreateDeal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: DealFormData) => {
      const response = await fetch('/api/deals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create deal');
      }

      return response.json() as Promise<DealWithRelations>;
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deals'] });
    },

    retry: 1,
  });
}

/**
 * Hook para atualizar deal
 * 
 * @example
 * const updateMutation = useUpdateDeal(dealId);
 * await updateMutation.mutateAsync({ name: 'Novo Nome' })
 */
export function useUpdateDeal(dealId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Partial<DealFormData>) => {
      const response = await fetch(`/api/deals/${dealId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update deal');
      }

      return response.json() as Promise<DealWithRelations>;
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deals'] });
      queryClient.invalidateQueries({ queryKey: ['deal', dealId] });
    },

    retry: 1,
  });
}

/**
 * Hook para deletar deal
 * 
 * @example
 * const deleteMutation = useDeleteDeal();
 * await deleteMutation.mutateAsync(dealId)
 */
export function useDeleteDeal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (dealId: string) => {
      const response = await fetch(`/api/deals/${dealId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete deal');
      }

      return response.json();
    },

    onSuccess: (_data, dealId) => {
      queryClient.invalidateQueries({ queryKey: ['deals'] });
      queryClient.removeQueries({ queryKey: ['deal', dealId] });
    },

    retry: 0,
  });
}

/**
 * Hook para mover deal entre stages
 * 
 * @example
 * const moveMutation = useMoveDeal();
 * await moveMutation.mutateAsync({ dealId, newStageId })
 */
export function useMoveDeal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      dealId,
      newStageId,
    }: {
      dealId: string;
      newStageId: string;
    }) => {
      const response = await fetch(`/api/deals/${dealId}/stage`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stage_id: newStageId }),
      });

      if (!response.ok) {
        throw new Error('Failed to move deal');
      }

      return response.json() as Promise<DealWithRelations>;
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deals'] });
    },

    retry: 1,
  });
}
