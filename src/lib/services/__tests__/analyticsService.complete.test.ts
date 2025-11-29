/**
 * Analytics Service Tests - KISS Approach
 * Testes críticos apenas (10 testes)
 * 
 * Abordagem KISS:
 * - Testa apenas código crítico (cálculos financeiros, datas, edge cases)
 * - Ignora funções triviais
 * - Mocks simples e funcionais
 */

import { describe, it, expect, jest } from '@jest/globals';
import type { SupabaseClient } from '@supabase/supabase-js';
import {
  calculateDateRange,
  calculatePreviousPeriod,
  fetchRealizedRevenue,
  fetchExpectedRevenue,
  buildRevenueData,
} from '@/lib/services/analyticsService';

// ============================================
// Mock Helpers (Simples e Funcional)
// ============================================

interface MockData {
  id?: string;
  value?: number;
  status?: string;
  closed_at?: string;
  created_at?: string;
  stage?: string;
  probability?: number;
  expected_close_date?: string;
  user_id?: string;
}

const createMockSupabase = (mockData: MockData[] = [], mockError: Error | null = null) => {
  const mockChain = {
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    gte: jest.fn().mockReturnThis(),
    lte: jest.fn().mockReturnThis(),
    in: jest.fn().mockReturnThis(),
    not: jest.fn().mockResolvedValue({ 
      data: mockError ? null : mockData, 
      error: mockError 
    }),
  };

  return {
    from: jest.fn(() => mockChain),
  } as unknown as SupabaseClient;
};

const mockDeal = (overrides: Partial<MockData> = {}): MockData => ({
  id: `deal-${Math.random()}`,
  value: 50000,
  status: 'won',
  closed_at: '2024-11-15T00:00:00.000Z',
  user_id: 'user-123',
  ...overrides,
});

// ============================================
// Testes Críticos
// ============================================

describe('calculateDateRange', () => {
  it('deve calcular intervalo de datas corretamente', () => {
    const result = calculateDateRange('30d');
    const start = new Date(result.startDate);
    const end = new Date(result.endDate);
    const diffDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    
    expect(diffDays).toBe(30);
  });
});

describe('calculatePreviousPeriod', () => {
  it('deve calcular período anterior sem sobreposição', () => {
    const current = {
      startDate: '2024-11-01T00:00:00.000Z',
      endDate: '2024-11-30T23:59:59.999Z',
    };
    
    const result = calculatePreviousPeriod(current);
    
    expect(new Date(result.endDate).getTime()).toBeLessThan(
      new Date(current.startDate).getTime()
    );
  });
});

describe('fetchRealizedRevenue', () => {
  it('deve calcular soma correta de valores', async () => {
    const mockDeals = [
      mockDeal({ value: 10000 }),
      mockDeal({ value: 20000 }),
      mockDeal({ value: 30000 }),
    ];
    const supabase = createMockSupabase(mockDeals);
    const dateRange = calculateDateRange('30d');
    
    const result = await fetchRealizedRevenue(supabase, 'user-123', dateRange);
    
    expect(result.total).toBe(60000);
  });

  it('deve prevenir NaN quando array vazio', async () => {
    const supabase = createMockSupabase([]);
    const dateRange = calculateDateRange('30d');
    
    const result = await fetchRealizedRevenue(supabase, 'user-123', dateRange);
    
    expect(result.total).toBe(0);
    expect(Number.isNaN(result.total)).toBe(false);
  });

  it('deve propagar erros do database', async () => {
    const mockError = new Error('Database error');
    const supabase = createMockSupabase([], mockError);
    const dateRange = calculateDateRange('30d');
    
    await expect(
      fetchRealizedRevenue(supabase, 'user-123', dateRange)
    ).rejects.toEqual(mockError);
  });

  it('deve agrupar por mês corretamente', async () => {
    const mockDeals = [
      mockDeal({ closed_at: '2024-11-15T00:00:00.000Z', value: 10000 }),
      mockDeal({ closed_at: '2024-11-20T00:00:00.000Z', value: 20000 }),
    ];
    const supabase = createMockSupabase(mockDeals);
    const dateRange = calculateDateRange('30d');
    
    const result = await fetchRealizedRevenue(supabase, 'user-123', dateRange);
    
    expect(result.byMonth).toBeDefined();
    expect(result.byMonth.length).toBeGreaterThan(0);
  });
});

describe('fetchExpectedRevenue', () => {
  it('deve calcular com probabilidade corretamente', async () => {
    const mockDeals = [
      mockDeal({ 
        value: 100000, 
        probability: 50,
        status: 'active',
      }),
    ];
    const supabase = createMockSupabase(mockDeals);
    const dateRange = calculateDateRange('30d');
    
    const result = await fetchExpectedRevenue(supabase, 'user-123', dateRange);
    
    expect(result.total).toBe(50000); // 100000 * 0.5
  });

  it('deve retornar zero (não NaN) quando probabilidade é 0', async () => {
    const mockDeals = [
      mockDeal({ 
        value: 100000, 
        probability: 0,
        status: 'active',
      }),
    ];
    const supabase = createMockSupabase(mockDeals);
    const dateRange = calculateDateRange('30d');
    
    const result = await fetchExpectedRevenue(supabase, 'user-123', dateRange);
    
    expect(result.total).toBe(0);
    expect(Number.isNaN(result.total)).toBe(false);
  });
});

describe('buildRevenueData', () => {
  it('deve combinar realized e expected corretamente', async () => {
    const mockRealizedDeals = [mockDeal({ value: 30000 })];
    const mockExpectedDeals = [
      mockDeal({ value: 100000, probability: 50, status: 'active' }),
    ];
    
    const supabase = {
      from: jest.fn((table: string) => {
        const isRealizedQuery = table === 'deals';
        const mockData = isRealizedQuery ? mockRealizedDeals : mockExpectedDeals;
        
        return {
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          gte: jest.fn().mockReturnThis(),
          lte: jest.fn().mockReturnThis(),
          in: jest.fn().mockReturnThis(),
          not: jest.fn().mockResolvedValue({ data: mockData, error: null }),
        };
      }),
    } as unknown as SupabaseClient;

    const dateRange = calculateDateRange('30d');
    
    const result = await buildRevenueData(supabase, 'user-123', dateRange);
    
    expect(result.realized.total).toBe(30000);
    expect(result.expected.total).toBe(50000);
  });
});

// ============================================
// Integration Test
// ============================================

describe('Integration: Pipeline Completo', () => {
  it('deve processar fluxo completo sem erros', async () => {
    const mockDeals = [
      mockDeal({ value: 10000 }),
      mockDeal({ value: 20000 }),
    ];
    const supabase = createMockSupabase(mockDeals);
    const dateRange = calculateDateRange('30d');
    
    const result = await fetchRealizedRevenue(supabase, 'user-123', dateRange);
    
    expect(result).toBeDefined();
    expect(result.total).toBe(30000);
    expect(result.byMonth).toBeDefined();
  });
});
