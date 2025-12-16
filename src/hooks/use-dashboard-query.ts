import { useQuery } from '@tanstack/react-query';

interface DashboardMetrics {
  totalContacts: number;
  activeConversations: number;
  conversionRate: number;
  newContacts: number;
  totalSales: number;
  trends: {
    contacts: number;
    conversations: number;
    conversion: number;
    newContacts: number;
    sales: number;
  };
}

type PeriodFilter = '7d' | '30d' | '90d' | 'all';

/**
 * Hook para buscar métricas do dashboard
 * 
 * @example
 * const { data: metrics, isLoading } = useDashboardMetrics('30d')
 */
export function useDashboardMetrics(period: PeriodFilter = '30d') {
  return useQuery({
    queryKey: ['dashboard-metrics', period],
    queryFn: async () => {
      // Usa a rota /api/dashboard/overview que já existe
      const response = await fetch(`/api/dashboard/overview?period=${period}`);

      if (!response.ok) {
        throw new Error('Failed to fetch metrics');
      }

      return response.json() as Promise<DashboardMetrics>;
    },

    // Cache por 10 minutos (métricas mudam menos)
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000,

    // Refetch ao voltar ao foco
    refetchOnWindowFocus: true,

    // Retry 1x em erro
    retry: 1,
  });
}
