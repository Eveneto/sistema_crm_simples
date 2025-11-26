/**
 * @jest-environment node
 */
import { NextRequest } from 'next/server';
import { GET } from '../route';
import { createClient } from '@/lib/supabase/server';

// Mock do Supabase
jest.mock('@/lib/supabase/server', () => ({
  createClient: jest.fn(),
}));

describe('GET /api/dashboard/sales', () => {
  const mockSupabaseClient = {
    from: jest.fn(),
  };

  beforeEach(() => {
    (createClient as jest.Mock).mockResolvedValue(mockSupabaseClient);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  const createMockRequest = (searchParams: Record<string, string> = {}) => {
    const url = new URL('http://localhost:3000/api/dashboard/sales');
    Object.entries(searchParams).forEach(([key, value]) => {
      url.searchParams.set(key, value);
    });

    return new NextRequest(url);
  };

  it('deve retornar dados de vendas agregados diariamente', async () => {
    const mockDeals = [
      { value: 5000, created_at: '2024-01-15', closed_at: '2024-01-15' },
      { value: 3000, created_at: '2024-01-15', closed_at: '2024-01-15' },
      { value: 7000, created_at: '2024-01-16', closed_at: '2024-01-16' },
    ];

    mockSupabaseClient.from.mockReturnValue({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          gte: jest.fn().mockReturnValue({
            order: jest.fn().mockResolvedValue({
              data: mockDeals,
              error: null,
            }),
          }),
        }),
      }),
    });

    const request = createMockRequest({ period: '30d', granularity: 'daily' });
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toHaveProperty('data');
    expect(data).toHaveProperty('period', '30d');
    expect(data).toHaveProperty('granularity', 'daily');
    expect(data).toHaveProperty('total');
    expect(Array.isArray(data.data)).toBe(true);
  });

  it('deve usar valores padrão quando parâmetros não são fornecidos', async () => {
    mockSupabaseClient.from.mockReturnValue({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          gte: jest.fn().mockReturnValue({
            order: jest.fn().mockResolvedValue({
              data: [],
              error: null,
            }),
          }),
        }),
      }),
    });

    const request = createMockRequest();
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.period).toBe('30d');
    expect(data.granularity).toBe('daily');
  });

  it('deve filtrar apenas deals com status "won"', async () => {
    const mockFrom = {
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          gte: jest.fn().mockReturnValue({
            order: jest.fn().mockResolvedValue({
              data: [],
              error: null,
            }),
          }),
        }),
      }),
    };

    mockSupabaseClient.from.mockReturnValue(mockFrom);

    const request = createMockRequest({ period: '7d' });
    await GET(request);

    expect(mockSupabaseClient.from).toHaveBeenCalledWith('deals');
    expect(mockFrom.select().eq).toHaveBeenCalledWith('status', 'won');
  });

  it('deve calcular o total de vendas corretamente', async () => {
    const mockDeals = [
      { value: 1000, created_at: '2024-01-15', closed_at: '2024-01-15' },
      { value: 2000, created_at: '2024-01-16', closed_at: '2024-01-16' },
      { value: 1500, created_at: '2024-01-17', closed_at: '2024-01-17' },
    ];

    mockSupabaseClient.from.mockReturnValue({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          gte: jest.fn().mockReturnValue({
            order: jest.fn().mockResolvedValue({
              data: mockDeals,
              error: null,
            }),
          }),
        }),
      }),
    });

    const request = createMockRequest();
    const response = await GET(request);
    const data = await response.json();

    expect(data.total).toBe(4500);
  });

  it('deve retornar array vazio quando não há vendas', async () => {
    mockSupabaseClient.from.mockReturnValue({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          gte: jest.fn().mockReturnValue({
            order: jest.fn().mockResolvedValue({
              data: [],
              error: null,
            }),
          }),
        }),
      }),
    });

    const request = createMockRequest();
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(Array.isArray(data.data)).toBe(true);
    expect(data.total).toBe(0);
  });

  it('deve retornar erro 500 quando o Supabase falha', async () => {
    mockSupabaseClient.from.mockReturnValue({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          gte: jest.fn().mockReturnValue({
            order: jest.fn().mockResolvedValue({
              data: null,
              error: { message: 'Database error' },
            }),
          }),
        }),
      }),
    });

    const request = createMockRequest();
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data).toHaveProperty('error', 'Failed to fetch sales data');
  });

  it('deve agregar vendas semanalmente', async () => {
    const mockDeals = [
      { value: 1000, created_at: '2024-01-01', closed_at: '2024-01-01' },
      { value: 2000, created_at: '2024-01-03', closed_at: '2024-01-03' },
      { value: 1500, created_at: '2024-01-08', closed_at: '2024-01-08' },
    ];

    mockSupabaseClient.from.mockReturnValue({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          gte: jest.fn().mockReturnValue({
            order: jest.fn().mockResolvedValue({
              data: mockDeals,
              error: null,
            }),
          }),
        }),
      }),
    });

    const request = createMockRequest({ period: '30d', granularity: 'weekly' });
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.granularity).toBe('weekly');
    expect(Array.isArray(data.data)).toBe(true);
  });

  it('deve agregar vendas mensalmente', async () => {
    const mockDeals = [
      { value: 5000, created_at: '2024-01-15', closed_at: '2024-01-15' },
      { value: 7000, created_at: '2024-02-10', closed_at: '2024-02-10' },
    ];

    mockSupabaseClient.from.mockReturnValue({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          gte: jest.fn().mockReturnValue({
            order: jest.fn().mockResolvedValue({
              data: mockDeals,
              error: null,
            }),
          }),
        }),
      }),
    });

    const request = createMockRequest({ period: '90d', granularity: 'monthly' });
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.granularity).toBe('monthly');
    expect(data.total).toBe(12000);
  });
});
