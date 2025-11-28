// ============================================
// Testes: API de Automações
// Sprint 3 - US-026
// ============================================

import { NextRequest } from 'next/server';
import { GET as getAutomations, POST as createAutomation } from '../route';
import { createClient } from '@/lib/supabase/server';

// Mock do Supabase
jest.mock('@/lib/supabase/server', () => ({
  createClient: jest.fn(),
}));

// Mock do logger
jest.mock('@/lib/logger', () => ({
  logger: {
    warn: jest.fn(),
    error: jest.fn(),
    info: jest.fn(),
    debug: jest.fn(),
  },
}));

describe('GET /api/automations', () => {
  const mockUser = {
    id: 'user-123',
    email: 'test@example.com',
  };

  const mockAutomations = [
    {
      id: 'automation-1',
      user_id: 'user-123',
      name: 'Mover negócio após 7 dias',
      description: 'Automação de follow-up',
      is_active: true,
      trigger_type: 'time_based',
      trigger_conditions: { days_inactive: 7 },
      actions: [{ type: 'move_stage', target_stage: 'negociacao' }],
      created_at: '2024-11-28T10:00:00Z',
      updated_at: '2024-11-28T10:00:00Z',
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('deve retornar 401 se usuário não autenticado', async () => {
    const mockSupabase = {
      auth: {
        getUser: jest.fn().mockResolvedValue({
          data: { user: null },
          error: new Error('Not authenticated'),
        }),
      },
    };

    (createClient as jest.Mock).mockResolvedValue(mockSupabase);

    const request = new NextRequest('http://localhost:3000/api/automations');
    const response = await getAutomations(request);

    expect(response.status).toBe(401);
    const data = await response.json();
    expect(data.error).toBe('Não autorizado');
  });

  it('deve listar automações do usuário', async () => {
    const mockSupabase = {
      auth: {
        getUser: jest.fn().mockResolvedValue({
          data: { user: mockUser },
          error: null,
        }),
      },
      from: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      range: jest.fn().mockResolvedValue({
        data: mockAutomations,
        error: null,
        count: 1,
      }),
    };

    (createClient as jest.Mock).mockResolvedValue(mockSupabase);

    const request = new NextRequest('http://localhost:3000/api/automations');
    const response = await getAutomations(request);

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.automations).toHaveLength(1);
    expect(data.total).toBe(1);
    expect(data.automations[0].name).toBe('Mover negócio após 7 dias');
  });

  it('deve filtrar por is_active', async () => {
    const mockSupabase = {
      auth: {
        getUser: jest.fn().mockResolvedValue({
          data: { user: mockUser },
          error: null,
        }),
      },
      from: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      range: jest.fn().mockResolvedValue({
        data: [mockAutomations[0]],
        error: null,
        count: 1,
      }),
    };

    (createClient as jest.Mock).mockResolvedValue(mockSupabase);

    const request = new NextRequest('http://localhost:3000/api/automations?is_active=true');
    const response = await getAutomations(request);

    expect(response.status).toBe(200);
    expect(mockSupabase.eq).toHaveBeenCalledWith('is_active', true);
  });

  it('deve paginar resultados', async () => {
    const mockSupabase = {
      auth: {
        getUser: jest.fn().mockResolvedValue({
          data: { user: mockUser },
          error: null,
        }),
      },
      from: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      range: jest.fn().mockResolvedValue({
        data: mockAutomations,
        error: null,
        count: 1,
      }),
    };

    (createClient as jest.Mock).mockResolvedValue(mockSupabase);

    const request = new NextRequest('http://localhost:3000/api/automations?page=2&limit=10');
    const response = await getAutomations(request);

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.page).toBe(2);
    expect(data.limit).toBe(10);
    expect(mockSupabase.range).toHaveBeenCalledWith(10, 19);
  });
});

describe('POST /api/automations', () => {
  const mockUser = {
    id: 'user-123',
    email: 'test@example.com',
  };

  const validAutomationData = {
    name: 'Nova automação',
    description: 'Descrição da automação',
    is_active: true,
    trigger_type: 'time_based' as const,
    trigger_conditions: { days_inactive: 7 },
    actions: [
      {
        type: 'move_stage' as const,
        target_stage: 'negociacao',
      },
    ],
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('deve retornar 401 se usuário não autenticado', async () => {
    const mockSupabase = {
      auth: {
        getUser: jest.fn().mockResolvedValue({
          data: { user: null },
          error: new Error('Not authenticated'),
        }),
      },
    };

    (createClient as jest.Mock).mockResolvedValue(mockSupabase);

    const request = new NextRequest('http://localhost:3000/api/automations', {
      method: 'POST',
      body: JSON.stringify(validAutomationData),
    });
    const response = await createAutomation(request);

    expect(response.status).toBe(401);
  });

  it('deve retornar 400 se dados inválidos', async () => {
    const mockSupabase = {
      auth: {
        getUser: jest.fn().mockResolvedValue({
          data: { user: mockUser },
          error: null,
        }),
      },
    };

    (createClient as jest.Mock).mockResolvedValue(mockSupabase);

    const invalidData = {
      name: 'ab', // muito curto (min 3 caracteres)
      trigger_type: 'time_based',
      actions: [],
    };

    const request = new NextRequest('http://localhost:3000/api/automations', {
      method: 'POST',
      body: JSON.stringify(invalidData),
    });
    const response = await createAutomation(request);

    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.error).toBe('Dados inválidos');
    expect(data.details).toBeDefined();
  });

  it('deve criar automação com sucesso', async () => {
    const createdAutomation = {
      id: 'automation-new',
      user_id: mockUser.id,
      ...validAutomationData,
      created_at: '2024-11-28T10:00:00Z',
      updated_at: '2024-11-28T10:00:00Z',
    };

    const mockSupabase = {
      auth: {
        getUser: jest.fn().mockResolvedValue({
          data: { user: mockUser },
          error: null,
        }),
      },
      from: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({
        data: createdAutomation,
        error: null,
      }),
    };

    (createClient as jest.Mock).mockResolvedValue(mockSupabase);

    const request = new NextRequest('http://localhost:3000/api/automations', {
      method: 'POST',
      body: JSON.stringify(validAutomationData),
    });
    const response = await createAutomation(request);

    expect(response.status).toBe(201);
    const data = await response.json();
    expect(data.automation).toBeDefined();
    expect(data.automation.name).toBe('Nova automação');
    expect(data.message).toBe('Automação criada com sucesso');
  });

  it('deve validar campos obrigatórios de ações', async () => {
    const mockSupabase = {
      auth: {
        getUser: jest.fn().mockResolvedValue({
          data: { user: mockUser },
          error: null,
        }),
      },
    };

    (createClient as jest.Mock).mockResolvedValue(mockSupabase);

    const invalidActionData = {
      name: 'Automação com ação inválida',
      trigger_type: 'time_based',
      trigger_conditions: { days_inactive: 7 },
      actions: [
        {
          type: 'move_stage',
          // faltando target_stage obrigatório
        },
      ],
    };

    const request = new NextRequest('http://localhost:3000/api/automations', {
      method: 'POST',
      body: JSON.stringify(invalidActionData),
    });
    const response = await createAutomation(request);

    expect(response.status).toBe(400);
  });
});
