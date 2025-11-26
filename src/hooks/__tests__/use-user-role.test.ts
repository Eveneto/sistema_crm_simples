import { renderHook, waitFor } from '@testing-library/react';
import { useUserRole } from '../use-user-role';
import { createClient } from '@/lib/supabase/client';

// Mock do createClient
jest.mock('@/lib/supabase/client', () => ({
  createClient: jest.fn(),
}));

describe('useUserRole', () => {
  let mockSupabase: {
    auth: {
      getUser: jest.Mock;
      onAuthStateChange: jest.Mock;
    };
    from: jest.Mock;
  };

  beforeEach(() => {
    jest.clearAllMocks();

    // Setup mock do Supabase
    mockSupabase = {
      auth: {
        getUser: jest.fn(),
        onAuthStateChange: jest.fn(() => ({
          data: { subscription: { unsubscribe: jest.fn() } },
        })),
      },
      from: jest.fn(),
    };

    (createClient as jest.Mock).mockReturnValue(mockSupabase);
  });

  it('deve retornar role null inicialmente', () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: null },
      error: null,
    });

    const { result } = renderHook(() => useUserRole());

    expect(result.current.role).toBeNull();
    expect(result.current.isLoading).toBe(true);
  });

  it('deve identificar admin corretamente', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: { id: 'user-123' } },
      error: null,
    });

    mockSupabase.from.mockReturnValue({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: { role: 'admin' },
            error: null,
          }),
        }),
      }),
    });

    const { result } = renderHook(() => useUserRole());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.role).toBe('admin');
    expect(result.current.isAdmin).toBe(true);
    expect(result.current.isManagerOrAdmin).toBe(true);
  });

  it('deve identificar manager corretamente', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: { id: 'user-456' } },
      error: null,
    });

    mockSupabase.from.mockReturnValue({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: { role: 'manager' },
            error: null,
          }),
        }),
      }),
    });

    const { result } = renderHook(() => useUserRole());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.role).toBe('manager');
    expect(result.current.isAdmin).toBe(false);
    expect(result.current.isManagerOrAdmin).toBe(true);
    expect(result.current.isAgent).toBe(false);
  });

  it('deve identificar agent corretamente', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: { id: 'user-789' } },
      error: null,
    });

    mockSupabase.from.mockReturnValue({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: { role: 'agent' },
            error: null,
          }),
        }),
      }),
    });

    const { result } = renderHook(() => useUserRole());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.role).toBe('agent');
    expect(result.current.isAdmin).toBe(false);
    expect(result.current.isManagerOrAdmin).toBe(false);
    expect(result.current.isAgent).toBe(true);
  });

  it('deve verificar permissões corretamente', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: { id: 'user-123' } },
      error: null,
    });

    mockSupabase.from.mockReturnValue({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: { role: 'admin' },
            error: null,
          }),
        }),
      }),
    });

    const { result } = renderHook(() => useUserRole());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Admin tem todas as permissões
    expect(result.current.checkPermission('canManageUsers')).toBe(true);
    expect(result.current.checkPermission('canManageChannels')).toBe(true);
    expect(result.current.checkPermission('canViewReports')).toBe(true);
  });
});
