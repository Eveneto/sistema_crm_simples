/**
 * useAnalytics Hook
 * Custom hook para buscar dados de analytics
 * 
 * Seguindo Clean Code:
 * - Extrai lógica de componentes
 * - Reutilizável
 * - Single Responsibility
 * - Nomes descritivos
 */

import { useState, useEffect, useCallback } from 'react';
import type {
  RevenueData,
  PipelineDistributionData,
  PerformanceMetrics,
  ForecastData,
  TrendsData,
  AnalyticsPeriod,
} from '@/types/analytics';

// ============================================
// Base Hook Configuration
// ============================================

interface UseAnalyticsOptions {
  period?: AnalyticsPeriod;
  autoFetch?: boolean;
}

interface UseAnalyticsState<T> {
  data: T | null;
  isLoading: boolean;
  error: string | null;
}

// ============================================
// Generic Fetch Hook
// ============================================

function useAnalyticsFetch<T>(
  endpoint: string,
  options: UseAnalyticsOptions = {}
): UseAnalyticsState<T> & { refetch: () => Promise<void> } {
  const { period = '30d', autoFetch = true } = options;

  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (period) params.append('period', period);

      const response = await fetch(`${endpoint}?${params.toString()}`);

      if (!response.ok) {
        throw new Error(`Erro ao buscar dados: ${response.statusText}`);
      }

      const result = await response.json();
      setData(result);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMessage);
      // Log only in development
      if (process.env.NODE_ENV === 'development') {
        console.error(`Erro em ${endpoint}:`, err);
      }
    } finally {
      setIsLoading(false);
    }
  }, [endpoint, period]);

  useEffect(() => {
    if (autoFetch) {
      fetchData();
    }
  }, [autoFetch, fetchData]);

  return {
    data,
    isLoading,
    error,
    refetch: fetchData,
  };
}

// ============================================
// Specific Hooks
// ============================================

/**
 * Hook para buscar dados de receita
 */
export function useRevenueData(options?: UseAnalyticsOptions) {
  return useAnalyticsFetch<RevenueData>('/api/analytics/revenue', options);
}

/**
 * Hook para buscar distribuição do pipeline
 */
export function usePipelineData() {
  return useAnalyticsFetch<PipelineDistributionData>('/api/analytics/pipeline', {
    autoFetch: true,
  });
}

/**
 * Hook para buscar métricas de performance
 */
export function usePerformanceMetrics(options?: UseAnalyticsOptions) {
  return useAnalyticsFetch<PerformanceMetrics>('/api/analytics/performance', options);
}

/**
 * Hook para buscar forecast
 */
export function useForecast(months: number = 3) {
  const endpoint = `/api/analytics/forecast?months=${months}`;
  return useAnalyticsFetch<ForecastData>(endpoint, { autoFetch: true });
}

/**
 * Hook para buscar tendências
 */
export function useTrends() {
  return useAnalyticsFetch<TrendsData>('/api/analytics/trends', { autoFetch: true });
}

// ============================================
// Combined Hook (All Analytics)
// ============================================

interface UseAllAnalyticsReturn {
  revenue: UseAnalyticsState<RevenueData> & { refetch: () => Promise<void> };
  pipeline: UseAnalyticsState<PipelineDistributionData> & { refetch: () => Promise<void> };
  performance: UseAnalyticsState<PerformanceMetrics> & { refetch: () => Promise<void> };
  forecast: UseAnalyticsState<ForecastData> & { refetch: () => Promise<void> };
  trends: UseAnalyticsState<TrendsData> & { refetch: () => Promise<void> };
  isAnyLoading: boolean;
  hasAnyError: boolean;
  refetchAll: () => Promise<void>;
}

/**
 * Hook combinado que busca todos os dados de analytics
 * Use quando precisar de todos os dados na mesma página
 */
export function useAllAnalytics(options?: UseAnalyticsOptions): UseAllAnalyticsReturn {
  const revenue = useRevenueData(options);
  const pipeline = usePipelineData();
  const performance = usePerformanceMetrics(options);
  const forecast = useForecast();
  const trends = useTrends();

  const isAnyLoading =
    revenue.isLoading ||
    pipeline.isLoading ||
    performance.isLoading ||
    forecast.isLoading ||
    trends.isLoading;

  const hasAnyError = !!(
    revenue.error ||
    pipeline.error ||
    performance.error ||
    forecast.error ||
    trends.error
  );

  const refetchAll = useCallback(async () => {
    await Promise.all([
      revenue.refetch(),
      pipeline.refetch(),
      performance.refetch(),
      forecast.refetch(),
      trends.refetch(),
    ]);
  }, [revenue, pipeline, performance, forecast, trends]);

  return {
    revenue,
    pipeline,
    performance,
    forecast,
    trends,
    isAnyLoading,
    hasAnyError,
    refetchAll,
  };
}
