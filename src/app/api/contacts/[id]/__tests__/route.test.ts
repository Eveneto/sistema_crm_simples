import { GET, PATCH, DELETE } from '../route';
import { createClient } from '@/lib/supabase/server';
import { NextRequest } from 'next/server';

// Mock do Supabase
jest.mock('@/lib/supabase/server', () => ({
  createClient: jest.fn(),
}));

const mockCreateClient = createClient as jest.MockedFunction<typeof createClient>;

describe('API /api/contacts/[id]', () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let mockSupabase: any;
  let mockRequest: NextRequest;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();

    // Mock do Supabase client
    mockSupabase = {
      auth: {
        getUser: jest.fn(),
      },
      from: jest.fn(() => mockSupabase),
      select: jest.fn(() => mockSupabase),
      eq: jest.fn(() => mockSupabase),
      neq: jest.fn(() => mockSupabase),
      or: jest.fn(() => mockSupabase),
      single: jest.fn(),
      update: jest.fn(() => mockSupabase),
      delete: jest.fn(() => mockSupabase),
    };

    mockCreateClient.mockResolvedValue(mockSupabase);

    // Mock do request
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mockRequest = {
      json: jest.fn(),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any;
  });

  describe('GET /api/contacts/[id]', () => {
    it('deve retornar 401 se não autenticado', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: new Error('Não autenticado'),
      });

      const response = await GET(mockRequest, { params: { id: 'test-id' } });
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Não autorizado');
    });

    it('deve retornar 404 se contato não encontrado', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-123' } },
        error: null,
      });

      mockSupabase.single.mockResolvedValue({
        data: null,
        error: new Error('Not found'),
      });

      const response = await GET(mockRequest, { params: { id: 'invalid-id' } });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe('Contato não encontrado');
    });

    it('deve retornar contato se encontrado', async () => {
      const mockContact = {
        id: 'contact-123',
        name: 'João Silva',
        email: 'joao@test.com',
        phone: '(11) 99999-9999',
        tags: ['cliente'],
        custom_fields: { company: 'TechCorp' },
      };

      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-123' } },
        error: null,
      });

      mockSupabase.single.mockResolvedValue({
        data: mockContact,
        error: null,
      });

      const response = await GET(mockRequest, { params: { id: 'contact-123' } });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data).toEqual(mockContact);
    });
  });

  describe('PATCH /api/contacts/[id]', () => {
    const validContactData = {
      name: 'João Silva Atualizado',
      email: 'joao.updated@test.com',
      phone: '(11) 98888-8888',
      company: 'TechCorp Updated',
      position: 'CTO',
      tags: ['cliente', 'vip'],
      notes: 'Contato atualizado',
    };

    beforeEach(() => {
      mockRequest.json = jest.fn().mockResolvedValue(validContactData);
    });

    it('deve retornar 401 se não autenticado', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: new Error('Não autenticado'),
      });

      const response = await PATCH(mockRequest, { params: { id: 'test-id' } });
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Não autorizado');
    });

    it('deve retornar 400 se dados inválidos', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-123' } },
        error: null,
      });

      mockRequest.json = jest.fn().mockResolvedValue({
        name: 'A', // Nome muito curto
        email: 'invalid-email',
      });

      const response = await PATCH(mockRequest, { params: { id: 'contact-123' } });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Dados inválidos');
    });

    it('deve retornar 404 se contato não encontrado', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-123' } },
        error: null,
      });

      mockSupabase.single.mockResolvedValue({
        data: null,
        error: new Error('Not found'),
      });

      const response = await PATCH(mockRequest, { params: { id: 'invalid-id' } });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe('Contato não encontrado');
    });

    it('deve retornar 409 se email já existe em outro contato', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-123' } },
        error: null,
      });

      // Mock do fluxo completo
      let selectCallCount = 0;
      mockSupabase.select.mockImplementation(() => {
        selectCallCount++;
        if (selectCallCount === 1) {
          // Primeira chamada: verificar se contato existe
          return {
            ...mockSupabase,
            eq: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({
                data: { id: 'contact-123' },
                error: null,
              }),
            }),
          };
        } else {
          // Segunda chamada: verificar duplicatas
          return {
            neq: jest.fn().mockReturnValue({
              or: jest.fn().mockResolvedValue({
                data: [
                  {
                    id: 'other-contact',
                    name: 'Outro Contato',
                    email: 'joao.updated@test.com',
                  },
                ],
                error: null,
              }),
            }),
          };
        }
      });

      const response = await PATCH(mockRequest, { params: { id: 'contact-123' } });
      const data = await response.json();

      expect(response.status).toBe(409);
      expect(data.error).toBe('Contato já existe');
    });

    it('deve atualizar contato com sucesso', async () => {
      const updatedContact = {
        id: 'contact-123',
        ...validContactData,
        custom_fields: {
          company: validContactData.company,
          position: validContactData.position,
          status: 'lead',
          notes: validContactData.notes,
        },
        updated_at: new Date().toISOString(),
      };

      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-123' } },
        error: null,
      });

      // Mock do fluxo completo
      let selectCallCount = 0;
      mockSupabase.select.mockImplementation(() => {
        selectCallCount++;
        if (selectCallCount === 1) {
          // Primeira chamada: verificar se contato existe
          return {
            eq: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({
                data: { id: 'contact-123' },
                error: null,
              }),
            }),
          };
        } else {
          // Segunda chamada: verificar duplicatas (não retorna nada)
          return {
            neq: jest.fn().mockReturnValue({
              or: jest.fn().mockResolvedValue({
                data: [],
                error: null,
              }),
            }),
          };
        }
      });

      // Mock do update
      mockSupabase.update.mockReturnValue({
        eq: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: updatedContact,
              error: null,
            }),
          }),
        }),
      });

      const response = await PATCH(mockRequest, { params: { id: 'contact-123' } });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.message).toBe('Contato atualizado com sucesso');
      expect(data.data).toBeDefined();
    });
  });

  describe('DELETE /api/contacts/[id]', () => {
    it('deve retornar 401 se não autenticado', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: new Error('Não autenticado'),
      });

      const response = await DELETE(mockRequest, { params: { id: 'test-id' } });
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Não autorizado');
    });

    it('deve retornar 404 se contato não encontrado', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-123' } },
        error: null,
      });

      mockSupabase.single.mockResolvedValue({
        data: null,
        error: new Error('Not found'),
      });

      const response = await DELETE(mockRequest, { params: { id: 'invalid-id' } });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe('Contato não encontrado');
    });

    it('deve excluir contato com sucesso', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-123' } },
        error: null,
      });

      mockSupabase.select.mockReturnValue({
        eq: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: { id: 'contact-123' },
            error: null,
          }),
        }),
      });

      mockSupabase.delete.mockReturnValue({
        eq: jest.fn().mockResolvedValue({
          error: null,
        }),
      });

      const response = await DELETE(mockRequest, { params: { id: 'contact-123' } });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.message).toBe('Contato excluído com sucesso');
    });
  });
});
