import { GET } from '../route';
import { createClient } from '@/lib/supabase/server';
import { NextRequest } from 'next/server';

// Mock do Supabase
jest.mock('@/lib/supabase/server', () => ({
  createClient: jest.fn(),
}));

const mockCreateClient = createClient as jest.MockedFunction<typeof createClient>;

describe('GET /api/deals/[id]', () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let mockSupabase: any;

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock do Supabase client
    mockSupabase = {
      auth: {
        getUser: jest.fn(),
      },
      from: jest.fn(() => mockSupabase),
      select: jest.fn(() => mockSupabase),
      eq: jest.fn(() => mockSupabase),
      single: jest.fn(),
    };

    mockCreateClient.mockResolvedValue(mockSupabase);
  });

  it('deve retornar 401 se usuário não autenticado', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: null },
      error: null,
    });

    const request = new NextRequest('http://localhost:3000/api/deals/123');
    const response = await GET(request, { params: { id: '123' } });
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe('Não autorizado');
  });

  it('deve retornar 404 se negócio não encontrado', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: { id: 'user-123' } },
      error: null,
    });

    mockSupabase.single.mockResolvedValue({
      data: null,
      error: new Error('Not found'),
    });

    const request = new NextRequest('http://localhost:3000/api/deals/999');
    const response = await GET(request, { params: { id: '999' } });
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.error).toBe('Negócio não encontrado');
  });

  it('deve retornar negócio com detalhes completos quando encontrado', async () => {
    const mockDeal = {
      id: 'deal-123',
      title: 'Implementação CRM',
      value: 50000,
      status: 'active',
      expected_close_date: '2025-12-31',
      description: 'Implementação completa do sistema CRM',
      user_id: 'user-123',
      contact_id: 'contact-456',
      stage_id: 'stage-789',
      created_at: '2025-01-15T10:00:00Z',
      updated_at: '2025-01-20T15:30:00Z',
      contact: {
        id: 'contact-456',
        name: 'João Silva',
        email: 'joao@empresa.com',
        phone: '11999999999',
      },
      stage: {
        id: 'stage-789',
        name: 'Proposta',
        color: '#3B82F6',
      },
    };

    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: { id: 'user-123' } },
      error: null,
    });

    const mockQuery = {
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({
        data: mockDeal,
        error: null,
      }),
    };

    mockSupabase.from.mockReturnValue(mockQuery);

    const request = new NextRequest('http://localhost:3000/api/deals/deal-123');
    const response = await GET(request, { params: { id: 'deal-123' } });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.deal).toEqual(mockDeal);

    // Verificar se a query foi chamada corretamente
    expect(mockSupabase.from).toHaveBeenCalledWith('deals');
    expect(mockQuery.select).toHaveBeenCalledWith(`
        *,
        contact:contacts(id, name, email, phone),
        stage:deal_stages(id, name, color)
      `);
    expect(mockQuery.eq).toHaveBeenCalledWith('id', 'deal-123');
    expect(mockQuery.eq).toHaveBeenCalledWith('user_id', 'user-123');
  });

  it('deve retornar negócio sem data de fechamento esperada', async () => {
    const mockDeal = {
      id: 'deal-456',
      title: 'Consultoria SEO',
      value: 25000,
      status: 'active',
      expected_close_date: null,
      description: 'Otimização de SEO para e-commerce',
      user_id: 'user-123',
      contact_id: 'contact-789',
      stage_id: 'stage-101',
      created_at: '2025-02-01T08:00:00Z',
      updated_at: '2025-02-05T12:00:00Z',
      contact: {
        id: 'contact-789',
        name: 'Maria Santos',
        email: 'maria@santos.com',
        phone: '11888888888',
      },
      stage: {
        id: 'stage-101',
        name: 'Negociação',
        color: '#10B981',
      },
    };

    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: { id: 'user-123' } },
      error: null,
    });

    const mockQuery = {
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({
        data: mockDeal,
        error: null,
      }),
    };

    mockSupabase.from.mockReturnValue(mockQuery);

    const request = new NextRequest('http://localhost:3000/api/deals/deal-456');
    const response = await GET(request, { params: { id: 'deal-456' } });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.deal.expected_close_date).toBeNull();
    expect(data.deal.contact).toBeDefined();
    expect(data.deal.stage).toBeDefined();
  });

  it('deve retornar 500 em caso de erro interno do servidor', async () => {
    mockSupabase.auth.getUser.mockRejectedValue(new Error('Database connection failed'));

    const request = new NextRequest('http://localhost:3000/api/deals/123');
    const response = await GET(request, { params: { id: '123' } });
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe('Erro interno do servidor');
  });

  it('deve retornar 404 quando Supabase retorna erro na query', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: { id: 'user-123' } },
      error: null,
    });

    const mockQuery = {
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({
        data: null,
        error: new Error('Query failed'),
      }),
    };

    mockSupabase.from.mockReturnValue(mockQuery);

    const request = new NextRequest('http://localhost:3000/api/deals/123');
    const response = await GET(request, { params: { id: '123' } });
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.error).toBe('Negócio não encontrado');
  });
});
