import { useQuery } from '@tanstack/react-query';

interface DashboardMetrics {
  totalContacts: number;
  totalConversations: number;
  totalDeals: number;
  totalRevenue: number;
  conversionRate: number;
  averageDealValue: number;
  salesChart: Array<{
    date: string;
    value: number;
  }>;
  recentConversations: Array<{
    id: string;
    contact_name: string;
    last_message: string;
    unread_count: number;
  }>;
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
    queryKey: ['metrics', period],
    queryFn: async () => {
      const response = await fetch(`/api/dashboard/metrics?period=${period}`);

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
