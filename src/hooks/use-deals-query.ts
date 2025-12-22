import { useQuery } from '@tanstack/react-query';
import type { DealWithRelations } from '@/types/deal';

/**
 * Hook para buscar todos os deals do pipeline
 *
 * @example
 * const { data: stages, isLoading } = useDeals()
 */
export function useDeals() {
  return useQuery({
    queryKey: ['deals'],
    queryFn: async () => {
      const response = await fetch('/api/deals?view=pipeline');

      if (!response.ok) {
        throw new Error('Failed to fetch deals');
      }

      const data = (await response.json()) as {
        stages: Array<{
          id: string;
          name: string;
          color: string;
          order_position: number;
          deals: DealWithRelations[];
          count: number;
          total_value: number;
        }>;
      };

      // Mapear order_position para order
      return {
        stages: data.stages.map((stage) => ({
          ...stage,
          order: stage.order_position,
          totalValue: stage.total_value,
        })),
      };
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
 * Hook para buscar um deal específico
 *
 * @example
 * const { data: deal } = useDeal(dealId)
 */
export function useDeal(dealId: string) {
  return useQuery({
    queryKey: ['deal', dealId],
    queryFn: async () => {
      const response = await fetch(`/api/deals/${dealId}`);

      if (!response.ok) {
        throw new Error('Failed to fetch deal');
      }

      return response.json() as Promise<DealWithRelations>;
    },

    staleTime: 5 * 60 * 1000,
    enabled: !!dealId,
  });
}
