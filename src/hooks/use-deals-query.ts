import { useQuery } from '@tanstack/react-query';
import type { DealWithRelations } from '@/types/deal';

interface PipelineStage {
  id: string;
  name: string;
  color: string;
  position: number;
  deals: DealWithRelations[];
  count: number;
  totalValue: number;
}

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
      const response = await fetch('/api/deals');

      if (!response.ok) {
        throw new Error('Failed to fetch deals');
      }

      return response.json() as Promise<{
        stages: PipelineStage[];
      }>;
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
