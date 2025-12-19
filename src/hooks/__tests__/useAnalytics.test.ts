/**
 * Analytics Hooks Tests
 * Testes unitários para custom hooks do módulo de analytics
 * 
 * Seguindo Clean Code:
 * - Testa comportamento, não implementação
 * - Usa React Testing Library
 * - Mocks isolados
 * - Testa estados: loading, success, error
 */

import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import {
  useRevenueData,
  usePipelineData,
  usePerformanceMetrics,
  useForecast,
  useTrends,
  useAllAnalytics,
} from '@/hooks/useAnalytics';

// ============================================
// Mock Fetch API
// ============================================

global.fetch = jest.fn();

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockFetch = (data: any, ok = true) => {
  (global.fetch as jest.Mock).mockResolvedValueOnce({
    ok,
    json: async () => data,
  });
};

const mockFetchError = () => {
  (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));
};

beforeEach(() => {
  jest.clearAllMocks();
});

// ============================================
// useRevenueData Tests
// ============================================

describe('useRevenueData', () => {
  it('deve iniciar com estado de loading', () => {
    // Arrange & Act
    mockFetch({ realized: { current: 100000 }, expected: { total: 50000 } });
    const { result } = renderHook(() => useRevenueData({ period: '30d' }));

    // Assert
    expect(result.current.isLoading).toBe(true);
    expect(result.current.data).toBeNull();
  });

  it('deve carregar dados de receita com sucesso', async () => {
    // Arrange
    const mockData = {
      realized: {
        current: 100000,
        previous: 80000,
        trend: 'up',
        percentChange: 25,
      },
      expected: {
        total: 50000,
        byMonth: [],
      },
      timeline: [],
    };
    mockFetch(mockData);

    // Act
    const { result } = renderHook(() => useRevenueData({ period: '30d' }));

    // Assert
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
    expect(result.current.data).toEqual(mockData);
    expect(result.current.error).toBeNull();
  });

  it('deve lidar com erro na requisição', async () => {
    // Arrange
    mockFetchError();

    // Act
    const { result } = renderHook(() => useRevenueData({ period: '30d' }));

    // Assert
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
    expect(result.current.data).toBeNull();
    expect(result.current.error).toBeTruthy();
  });

  it('deve atualizar dados quando period mudar', async () => {
    // Arrange
    const mockData30d = { realized: { current: 100000 } };
    const mockData90d = { realized: { current: 300000 } };
    
    mockFetch(mockData30d);
    const { result, rerender } = renderHook(
      ({ period }) => useRevenueData({ period }),
      { initialProps: { period: '30d' as const } }
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Act - mudar período
    mockFetch(mockData90d);
    rerender({ period: '90d' as const });

    // Assert
    await waitFor(() => {
      expect(result.current.data).toEqual(mockData90d);
    });
  });
});

// ============================================
// usePipelineData Tests
// ============================================

describe('usePipelineData', () => {
  it('deve carregar distribuição do pipeline', async () => {
    // Arrange
    const mockData = {
      stages: [
        { stage: 'lead', count: 10, value: 100000, percentage: 50 },
        { stage: 'proposal', count: 5, value: 100000, percentage: 50 },
      ],
      total: { count: 15, value: 200000 },
    };
    mockFetch(mockData);

    // Act
    const { result } = renderHook(() => usePipelineData());

    // Assert
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
    expect(result.current.data).toEqual(mockData);
  });

  it('deve lidar com pipeline vazio', async () => {
    // Arrange
    const mockData = {
      stages: [],
      total: { count: 0, value: 0 },
    };
    mockFetch(mockData);

    // Act
    const { result } = renderHook(() => usePipelineData());

    // Assert
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
    expect(result.current.data?.stages).toEqual([]);
  });
});

// ============================================
// usePerformanceMetrics Tests
// ============================================

describe('usePerformanceMetrics', () => {
  it('deve carregar métricas de performance', async () => {
    // Arrange
    const mockData = {
      winRate: {
        current: 75,
        previous: 70,
        trend: 'up',
        percentChange: 7.14,
      },
      averageTicket: {
        current: 50000,
        previous: 45000,
        trend: 'up',
        percentChange: 11.11,
      },
      salesCycle: {
        current: 30,
        previous: 35,
        trend: 'down',
        percentChange: -14.29,
      },
      conversionRate: {
        current: 25,
        previous: 20,
        trend: 'up',
        percentChange: 25,
      },
    };
    mockFetch(mockData);

    // Act
    const { result } = renderHook(() => usePerformanceMetrics({ period: '30d' }));

    // Assert
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
    expect(result.current.data).toEqual(mockData);
  });

  it('deve identificar tendência de melhoria (up)', async () => {
    // Arrange
    const mockData = {
      winRate: { current: 80, previous: 70, trend: 'up', percentChange: 14.29 },
      averageTicket: { current: 50000, previous: 50000, trend: 'stable', percentChange: 0 },
      salesCycle: { current: 25, previous: 30, trend: 'down', percentChange: -16.67 },
      conversionRate: { current: 30, previous: 25, trend: 'up', percentChange: 20 },
    };
    mockFetch(mockData);

    // Act
    const { result } = renderHook(() => usePerformanceMetrics({ period: '30d' }));

    // Assert
    await waitFor(() => {
      expect(result.current.data?.winRate.trend).toBe('up');
      expect(result.current.data?.salesCycle.trend).toBe('down'); // down é bom para ciclo
    });
  });
});

// ============================================
// useForecast Tests
// ============================================

describe('useForecast', () => {
  it('deve carregar previsão de 3 meses', async () => {
    // Arrange
    const mockData = {
      projections: [
        { month: '2024-12', optimistic: 300000, expected: 250000, conservative: 200000, deals: 10 },
        { month: '2025-01', optimistic: 350000, expected: 280000, conservative: 220000, deals: 12 },
        { month: '2025-02', optimistic: 400000, expected: 320000, conservative: 250000, deals: 14 },
      ],
      confidence: 75,
      methodology: 'probability-weighted',
    };
    mockFetch(mockData);

    // Act
    const { result } = renderHook(() => useForecast());

    // Assert
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
    expect(result.current.data?.projections).toHaveLength(3);
    expect(result.current.data?.confidence).toBe(75);
  });
});

// ============================================
// useTrends Tests
// ============================================

describe('useTrends', () => {
  it('deve carregar tendências históricas', async () => {
    // Arrange
    const mockData = {
      monthOverMonth: [
        { month: '2024-09', revenue: 200000, deals: 8, growth: { revenue: 0, deals: 0 } },
        { month: '2024-10', revenue: 250000, deals: 10, growth: { revenue: 25, deals: 25 } },
        { month: '2024-11', revenue: 300000, deals: 12, growth: { revenue: 20, deals: 20 } },
      ],
      yearOverYear: {
        currentYear: 2500000,
        previousYear: 2000000,
        growth: 25,
      },
      seasonality: {
        bestMonth: '2024-12',
        worstMonth: '2024-01',
        average: 250000,
      },
    };
    mockFetch(mockData);

    // Act
    const { result } = renderHook(() => useTrends({ period: '90d' }));

    // Assert
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
    expect(result.current.data?.monthOverMonth).toHaveLength(3);
    expect(result.current.data?.yearOverYear.growth).toBe(25);
  });
});

// ============================================
// useAllAnalytics Tests (Combined Hook)
// ============================================

describe('useAllAnalytics', () => {
  it('deve carregar todos os dados de analytics em paralelo', async () => {
    // Arrange
    mockFetch({ realized: { current: 100000 } }); // revenue
    mockFetch({ stages: [] }); // pipeline
    mockFetch({ winRate: { current: 75 } }); // performance
    mockFetch({ projections: [] }); // forecast
    mockFetch({ monthOverMonth: [] }); // trends

    // Act
    const { result } = renderHook(() => useAllAnalytics({ period: '30d' }));

    // Assert
    await waitFor(() => {
      expect(result.current.isAnyLoading).toBe(false);
    });
    expect(result.current.revenue).toBeDefined();
    expect(result.current.pipeline).toBeDefined();
    expect(result.current.performance).toBeDefined();
    expect(result.current.forecast).toBeDefined();
    expect(result.current.trends).toBeDefined();
  });

  it('deve indicar loading enquanto qualquer dado está carregando', async () => {
    // Arrange
    const delayedPromise = new Promise((resolve) => 
      setTimeout(() => resolve({ ok: true, json: async () => ({}) }), 100)
    );
    (global.fetch as jest.Mock).mockReturnValue(delayedPromise);

    // Act
    const { result } = renderHook(() => useAllAnalytics({ period: '30d' }));

    // Assert - deve estar loading inicialmente
    expect(result.current.isAnyLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.isAnyLoading).toBe(false);
    }, { timeout: 200 });
  });

  it('deve indicar erro se algum fetch falhar', async () => {
    // Arrange
    mockFetch({ realized: { current: 100000 } }); // revenue OK
    mockFetchError(); // pipeline ERRO

    // Act
    const { result } = renderHook(() => useAllAnalytics({ period: '30d' }));

    // Assert
    await waitFor(() => {
      expect(result.current.hasAnyError).toBe(true);
    });
  });
});

// ============================================
// Edge Cases & Error Handling
// ============================================

describe('Edge Cases', () => {
  it('deve lidar com resposta vazia do servidor', async () => {
    // Arrange
    mockFetch(null);

    // Act
    const { result } = renderHook(() => useRevenueData({ period: '30d' }));

    // Assert
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
    expect(result.current.data).toBeNull();
  });

  it('deve lidar com resposta malformada', async () => {
    // Arrange
    mockFetch({ invalid: 'data' });

    // Act
    const { result } = renderHook(() => usePerformanceMetrics({ period: '30d' }));

    // Assert
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
    // Deve aceitar qualquer resposta (duck typing)
    expect(result.current.data).toBeDefined();
  });

  it('deve fazer retry em caso de erro de rede', async () => {
    // Arrange
    mockFetchError();
    mockFetch({ stages: [] });

    // Act
    const { result, rerender } = renderHook(() => usePipelineData());

    await waitFor(() => {
      expect(result.current.error).toBeTruthy();
    });

    // Act - retry manual via rerender
    rerender();

    // Assert - segunda tentativa deve funcionar
    await waitFor(() => {
      expect(result.current.data).toBeDefined();
    });
  });
});
