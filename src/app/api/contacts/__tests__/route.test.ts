import { GET, POST } from '../route';
import { createClient } from '@/lib/supabase/server';
import { NextRequest } from 'next/server';

// Mock do Supabase
jest.mock('@/lib/supabase/server', () => ({
  createClient: jest.fn(),
}));

describe('GET /api/contacts', () => {
  const mockSupabase = {
    auth: {
      getUser: jest.fn(),
    },
    from: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (createClient as jest.Mock).mockResolvedValue(mockSupabase);
  });

  it('deve retornar 401 se usuário não autenticado', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: null },
      error: new Error('Not authenticated'),
    });

    const request = new NextRequest('http://localhost:3000/api/contacts');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe('Não autorizado');
  });

  it('deve retornar lista de contatos com paginação', async () => {
    const mockContacts = [
      {
        id: '1',
        name: 'João Silva',
        email: 'joao@test.com',
        phone: '11999999999',
        tags: ['cliente'],
        custom_fields: { company: 'Test Corp' },
        created_at: '2025-01-01',
        updated_at: '2025-01-01',
      },
      {
        id: '2',
        name: 'Maria Santos',
        email: 'maria@test.com',
        phone: '11988888888',
        tags: ['lead'],
        custom_fields: { company: 'Another Corp' },
        created_at: '2025-01-02',
        updated_at: '2025-01-02',
      },
    ];

    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: { id: 'user-123' } },
      error: null,
    });

    const mockQuery = {
      select: jest.fn().mockReturnThis(),
      or: jest.fn().mockReturnThis(),
      overlaps: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      range: jest.fn().mockResolvedValue({
        data: mockContacts,
        error: null,
        count: 2,
      }),
    };

    mockSupabase.from.mockReturnValue(mockQuery);

    const request = new NextRequest('http://localhost:3000/api/contacts?page=1&limit=20');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.data).toHaveLength(2);
    expect(data.pagination).toEqual({
      page: 1,
      limit: 20,
      total: 2,
      totalPages: 1,
      hasNext: false,
      hasPrev: false,
    });
  });

  it('deve aplicar busca corretamente', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: { id: 'user-123' } },
      error: null,
    });

    const mockQuery = {
      select: jest.fn().mockReturnThis(),
      or: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      range: jest.fn().mockResolvedValue({
        data: [],
        error: null,
        count: 0,
      }),
    };

    mockSupabase.from.mockReturnValue(mockQuery);

    const request = new NextRequest('http://localhost:3000/api/contacts?search=João');
    await GET(request);

    expect(mockQuery.or).toHaveBeenCalledWith(
      expect.stringContaining('name.ilike.%João%')
    );
  });

  it('deve aplicar filtro de tags', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: { id: 'user-123' } },
      error: null,
    });

    const mockQuery = {
      select: jest.fn().mockReturnThis(),
      or: jest.fn().mockReturnThis(),
      overlaps: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      range: jest.fn().mockResolvedValue({
        data: [],
        error: null,
        count: 0,
      }),
    };

    mockSupabase.from.mockReturnValue(mockQuery);

    const request = new NextRequest('http://localhost:3000/api/contacts?tags=cliente,lead');
    await GET(request);

    expect(mockQuery.overlaps).toHaveBeenCalledWith('tags', ['cliente', 'lead']);
  });

  it('deve retornar erro 500 se houver erro no Supabase', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: { id: 'user-123' } },
      error: null,
    });

    const mockQuery = {
      select: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      range: jest.fn().mockResolvedValue({
        data: null,
        error: { message: 'Database error' },
        count: null,
      }),
    };

    mockSupabase.from.mockReturnValue(mockQuery);

    const request = new NextRequest('http://localhost:3000/api/contacts');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe('Erro ao buscar contatos');
  });

  it('deve calcular paginação corretamente', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: { id: 'user-123' } },
      error: null,
    });

    const mockQuery = {
      select: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      range: jest.fn().mockResolvedValue({
        data: [],
        error: null,
        count: 45, // 45 contatos total
      }),
    };

    mockSupabase.from.mockReturnValue(mockQuery);

    const request = new NextRequest('http://localhost:3000/api/contacts?page=2&limit=20');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.pagination).toEqual({
      page: 2,
      limit: 20,
      total: 45,
      totalPages: 3,
      hasNext: true,
      hasPrev: true,
    });
  });
});

describe('POST /api/contacts', () => {
  const mockSupabase = {
    auth: {
      getUser: jest.fn(),
    },
    from: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (createClient as jest.Mock).mockResolvedValue(mockSupabase);
  });

  it('deve criar contato com sucesso quando não há duplicatas', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: { id: 'user-123' } },
      error: null,
    });

    // Mock do fluxo completo
    let fromCallCount = 0;
    mockSupabase.from.mockImplementation(() => {
      fromCallCount++;
      if (fromCallCount === 1) {
        // Primeira chamada: verificar duplicatas
        return {
          select: jest.fn().mockReturnThis(),
          or: jest.fn().mockResolvedValue({ data: [], error: null }),
        };
      } else {
        // Segunda chamada: inserir contato
        return {
          insert: jest.fn().mockReturnValue({
            select: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({
                data: {
                  id: 'new-id',
                  name: 'João Silva',
                  email: 'joao@test.com',
                  phone: '(11) 99999-9999',
                  tags: [],
                  custom_fields: { company: 'TechCorp' },
                },
                error: null,
              }),
            }),
          }),
        };
      }
    });

    const request = new NextRequest('http://localhost:3000/api/contacts', {
      method: 'POST',
      body: JSON.stringify({
        name: 'João Silva',
        email: 'joao@test.com',
        phone: '(11) 99999-9999',
        company: 'TechCorp',
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data.message).toBe('Contato criado com sucesso');
    expect(data.data?.name).toBe('João Silva');
  });

  it('deve retornar 401 se não autenticado', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: null },
      error: new Error('Not authenticated'),
    });

    const request = new NextRequest('http://localhost:3000/api/contacts', {
      method: 'POST',
      body: JSON.stringify({ name: 'João Silva' }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe('Não autorizado');
  });

  it('deve retornar 400 para dados inválidos', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: { id: 'user-123' } },
      error: null,
    });

    const request = new NextRequest('http://localhost:3000/api/contacts', {
      method: 'POST',
      body: JSON.stringify({ name: 'A' }), // Nome muito curto
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Dados inválidos');
  });

  it('deve detectar contato duplicado por email', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: { id: 'user-123' } },
      error: null,
    });

    // Mock: duplicate found
    mockSupabase.from.mockReturnValue({
      select: jest.fn().mockReturnValue({
        or: jest.fn().mockResolvedValue({
          data: [{ id: 'existing-id', name: 'João Silva', email: 'joao@test.com' }],
          error: null,
        }),
      }),
    });

    const request = new NextRequest('http://localhost:3000/api/contacts', {
      method: 'POST',
      body: JSON.stringify({
        name: 'João Silva Novo',
        email: 'joao@test.com', // email duplicado
        phone: '(11) 99999-9999',
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(409);
    expect(data.error).toBe('Contato já existe');
  });
});
