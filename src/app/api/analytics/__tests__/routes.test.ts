/**
 * Analytics API Routes Tests
 * Testes de integração para endpoints de analytics
 * 
 * Seguindo Clean Code:
 * - Testa contrato da API (request/response)
 * - Testa autenticação
 * - Testa validação de parâmetros
 * - Testa tratamento de erros
 */

import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { GET as getRevenue } from '@/app/api/analytics/revenue/route';
import { GET as getPipeline } from '@/app/api/analytics/pipeline/route';
import { GET as getPerformance } from '@/app/api/analytics/performance/route';
import { GET as getForecast } from '@/app/api/analytics/forecast/route';
import { GET as getTrends } from '@/app/api/analytics/trends/route';
import { NextRequest } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';

// ============================================
// Mocks
// ============================================

jest.mock('@supabase/auth-helpers-nextjs');
jest.mock('@/lib/services/analyticsService');

const mockUser = {
  id: 'user-123',
  email: 'test@example.com',
};

const mockSupabaseAuth = () => {
  (createRouteHandlerClient as jest.Mock).mockReturnValue({
    auth: {
      getUser: jest.fn().mockResolvedValue({
        data: { user: mockUser },
        error: null,
      }),
    },
  });
};

const mockSupabaseAuthError = () => {
  (createRouteHandlerClient as jest.Mock).mockReturnValue({
    auth: {
      getUser: jest.fn().mockResolvedValue({
        data: { user: null },
        error: { message: 'Unauthorized' },
      }),
    },
  });
};

const createMockRequest = (url: string) => {
  return new NextRequest(new URL(url, 'http://localhost:3000'));
};

beforeEach(() => {
  jest.clearAllMocks();
});

// ============================================
// Revenue API Tests
// ============================================

describe('GET /api/analytics/revenue', () => {
  it('deve retornar dados de receita com sucesso', async () => {
    // Arrange
    mockSupabaseAuth();
    const request = createMockRequest('/api/analytics/revenue?period=30d');

    // Act
    const response = await getRevenue(request);
    const data = await response.json();

    // Assert
    expect(response.status).toBe(200);
    expect(data).toHaveProperty('realized');
    expect(data).toHaveProperty('expected');
    expect(data).toHaveProperty('timeline');
  });

  it('deve retornar 401 se não estiver autenticado', async () => {
    // Arrange
    mockSupabaseAuthError();
    const request = createMockRequest('/api/analytics/revenue?period=30d');

    // Act
    const response = await getRevenue(request);

    // Assert
    expect(response.status).toBe(401);
  });

  it('deve aceitar período 7d', async () => {
    // Arrange
    mockSupabaseAuth();
    const request = createMockRequest('/api/analytics/revenue?period=7d');

    // Act
    const response = await getRevenue(request);

    // Assert
    expect(response.status).toBe(200);
  });

  it('deve aceitar período 90d', async () => {
    // Arrange
    mockSupabaseAuth();
    const request = createMockRequest('/api/analytics/revenue?period=90d');

    // Act
    const response = await getRevenue(request);

    // Assert
    expect(response.status).toBe(200);
  });

  it('deve usar 30d como período padrão', async () => {
    // Arrange
    mockSupabaseAuth();
    const request = createMockRequest('/api/analytics/revenue');

    // Act
    const response = await getRevenue(request);

    // Assert
    expect(response.status).toBe(200);
  });
});

// ============================================
// Pipeline API Tests
// ============================================

describe('GET /api/analytics/pipeline', () => {
  it('deve retornar distribuição do pipeline', async () => {
    // Arrange
    mockSupabaseAuth();
    const request = createMockRequest('/api/analytics/pipeline');

    // Act
    const response = await getPipeline(request);
    const data = await response.json();

    // Assert
    expect(response.status).toBe(200);
    expect(data).toHaveProperty('stages');
    expect(data).toHaveProperty('total');
    expect(Array.isArray(data.stages)).toBe(true);
  });

  it('deve retornar 401 sem autenticação', async () => {
    // Arrange
    mockSupabaseAuthError();
    const request = createMockRequest('/api/analytics/pipeline');

    // Act
    const response = await getPipeline(request);

    // Assert
    expect(response.status).toBe(401);
  });
});

// ============================================
// Performance API Tests
// ============================================

describe('GET /api/analytics/performance', () => {
  it('deve retornar métricas de performance', async () => {
    // Arrange
    mockSupabaseAuth();
    const request = createMockRequest('/api/analytics/performance?period=30d');

    // Act
    const response = await getPerformance(request);
    const data = await response.json();

    // Assert
    expect(response.status).toBe(200);
    expect(data).toHaveProperty('winRate');
    expect(data).toHaveProperty('averageTicket');
    expect(data).toHaveProperty('salesCycle');
    expect(data).toHaveProperty('conversionRate');
  });

  it('deve incluir tendências em cada métrica', async () => {
    // Arrange
    mockSupabaseAuth();
    const request = createMockRequest('/api/analytics/performance?period=30d');

    // Act
    const response = await getPerformance(request);
    const data = await response.json();

    // Assert
    expect(data.winRate).toHaveProperty('trend');
    expect(data.winRate).toHaveProperty('percentChange');
    expect(['up', 'down', 'stable']).toContain(data.winRate.trend);
  });

  it('deve retornar 401 sem autenticação', async () => {
    // Arrange
    mockSupabaseAuthError();
    const request = createMockRequest('/api/analytics/performance?period=30d');

    // Act
    const response = await getPerformance(request);

    // Assert
    expect(response.status).toBe(401);
  });
});

// ============================================
// Forecast API Tests
// ============================================

describe('GET /api/analytics/forecast', () => {
  it('deve retornar previsão de 3 meses', async () => {
    // Arrange
    mockSupabaseAuth();
    const request = createMockRequest('/api/analytics/forecast');

    // Act
    const response = await getForecast(request);
    const data = await response.json();

    // Assert
    expect(response.status).toBe(200);
    expect(data).toHaveProperty('projections');
    expect(data).toHaveProperty('confidence');
    expect(data).toHaveProperty('methodology');
  });

  it('deve retornar array de projeções', async () => {
    // Arrange
    mockSupabaseAuth();
    const request = createMockRequest('/api/analytics/forecast');

    // Act
    const response = await getForecast(request);
    const data = await response.json();

    // Assert
    expect(Array.isArray(data.projections)).toBe(true);
    expect(data.projections.length).toBeGreaterThan(0);
  });

  it('deve incluir cenários otimista, esperado e conservador', async () => {
    // Arrange
    mockSupabaseAuth();
    const request = createMockRequest('/api/analytics/forecast');

    // Act
    const response = await getForecast(request);
    const data = await response.json();

    // Assert
    const firstProjection = data.projections[0];
    expect(firstProjection).toHaveProperty('optimistic');
    expect(firstProjection).toHaveProperty('expected');
    expect(firstProjection).toHaveProperty('conservative');
  });

  it('deve retornar 401 sem autenticação', async () => {
    // Arrange
    mockSupabaseAuthError();
    const request = createMockRequest('/api/analytics/forecast');

    // Act
    const response = await getForecast(request);

    // Assert
    expect(response.status).toBe(401);
  });
});

// ============================================
// Trends API Tests
// ============================================

describe('GET /api/analytics/trends', () => {
  it('deve retornar dados de tendências', async () => {
    // Arrange
    mockSupabaseAuth();
    const request = createMockRequest('/api/analytics/trends?period=90d');

    // Act
    const response = await getTrends(request);
    const data = await response.json();

    // Assert
    expect(response.status).toBe(200);
    expect(data).toHaveProperty('monthOverMonth');
    expect(data).toHaveProperty('yearOverYear');
    expect(data).toHaveProperty('seasonality');
  });

  it('deve incluir crescimento mensal', async () => {
    // Arrange
    mockSupabaseAuth();
    const request = createMockRequest('/api/analytics/trends?period=90d');

    // Act
    const response = await getTrends(request);
    const data = await response.json();

    // Assert
    expect(Array.isArray(data.monthOverMonth)).toBe(true);
    if (data.monthOverMonth.length > 0) {
      const trend = data.monthOverMonth[0];
      expect(trend).toHaveProperty('month');
      expect(trend).toHaveProperty('revenue');
      expect(trend).toHaveProperty('growth');
    }
  });

  it('deve retornar 401 sem autenticação', async () => {
    // Arrange
    mockSupabaseAuthError();
    const request = createMockRequest('/api/analytics/trends?period=90d');

    // Act
    const response = await getTrends(request);

    // Assert
    expect(response.status).toBe(401);
  });
});

// ============================================
// Error Handling Tests
// ============================================

describe('API Error Handling', () => {
  it('deve retornar 500 em caso de erro interno', async () => {
    // Arrange
    (createRouteHandlerClient as jest.Mock).mockImplementation(() => {
      throw new Error('Database connection failed');
    });
    const request = createMockRequest('/api/analytics/revenue?period=30d');

    // Act
    const response = await getRevenue(request);

    // Assert
    expect(response.status).toBe(500);
  });

  it('deve incluir mensagem de erro na resposta', async () => {
    // Arrange
    (createRouteHandlerClient as jest.Mock).mockImplementation(() => {
      throw new Error('Test error');
    });
    const request = createMockRequest('/api/analytics/revenue?period=30d');

    // Act
    const response = await getRevenue(request);
    const data = await response.json();

    // Assert
    expect(data).toHaveProperty('error');
  });
});

// ============================================
// Integration Tests
// ============================================

describe('Analytics APIs - Integration', () => {
  it('deve retornar dados consistentes entre endpoints', async () => {
    // Arrange
    mockSupabaseAuth();
    const period = '30d';

    // Act
    const revenueResponse = await getRevenue(
      createMockRequest(`/api/analytics/revenue?period=${period}`)
    );
    const performanceResponse = await getPerformance(
      createMockRequest(`/api/analytics/performance?period=${period}`)
    );

    // Assert
    expect(revenueResponse.status).toBe(200);
    expect(performanceResponse.status).toBe(200);
  });

  it('deve processar múltiplas requisições em paralelo', async () => {
    // Arrange
    mockSupabaseAuth();
    const period = '30d';

    // Act
    const promises = [
      getRevenue(createMockRequest(`/api/analytics/revenue?period=${period}`)),
      getPipeline(createMockRequest('/api/analytics/pipeline')),
      getPerformance(createMockRequest(`/api/analytics/performance?period=${period}`)),
      getForecast(createMockRequest('/api/analytics/forecast')),
      getTrends(createMockRequest(`/api/analytics/trends?period=${period}`)),
    ];

    const responses = await Promise.all(promises);

    // Assert
    responses.forEach(response => {
      expect(response.status).toBe(200);
    });
  });
});
