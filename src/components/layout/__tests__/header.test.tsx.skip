import { render, screen } from '@testing-library/react';
import { Header } from '../header';

const mockUseUserRole = jest.fn();
const mockPush = jest.fn();
const mockToast = jest.fn();

// Mock do useUserRole
jest.mock('@/hooks/use-user-role', () => ({
  useUserRole: () => mockUseUserRole(),
}));

// Mock do Next.js router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

// Mock do ThemeToggle
jest.mock('@/components/theme-toggle', () => ({
  ThemeToggle: () => <div data-testid="theme-toggle">Theme Toggle</div>,
}));

// Mock do useToast
jest.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: mockToast,
  }),
}));

// Mock do Supabase createClient
jest.mock('@/lib/supabase/client', () => ({
  createClient: () => ({
    auth: {
      signOut: jest.fn().mockResolvedValue({ error: null }),
    },
  }),
}));

describe('Header', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Renderização', () => {
    beforeEach(() => {
      mockUseUserRole.mockReturnValue({
        profile: {
          full_name: 'João Silva',
          role: 'admin',
        },
        role: 'admin',
        isLoading: false,
      });
    });

    it('deve renderizar o header', () => {
      render(<Header />);

      // Verifica se o elemento header está presente
      const header = document.querySelector('header');
      expect(header).toBeInTheDocument();
    });

    it('deve renderizar o nome do usuário', () => {
      render(<Header />);

      expect(screen.getByText('João Silva')).toBeInTheDocument();
    });

    it('deve renderizar o ThemeToggle', () => {
      render(<Header />);

      expect(screen.getByTestId('theme-toggle')).toBeInTheDocument();
    });

    it('deve renderizar avatar com iniciais', () => {
      render(<Header />);

      const avatar = screen.getByText('JS'); // Iniciais de João Silva
      expect(avatar).toBeInTheDocument();
    });

    it('deve ter dropdown menu trigger', () => {
      render(<Header />);

      // Verifica se existe um botão com o nome do usuário
      const trigger = screen.getByText('João Silva');
      expect(trigger).toBeInTheDocument();
    });
  });

  describe('Diferentes Roles', () => {
    it('deve renderizar para manager', () => {
      mockUseUserRole.mockReturnValue({
        profile: { full_name: 'Pedro Oliveira', role: 'manager' },
        role: 'manager',
        isLoading: false,
      });

      render(<Header />);

      expect(screen.getByText('Pedro Oliveira')).toBeInTheDocument();
      expect(screen.getByText('Gerente')).toBeInTheDocument();
    });

    it('deve renderizar para agent', () => {
      mockUseUserRole.mockReturnValue({
        profile: { full_name: 'Ana Costa', role: 'agent' },
        role: 'agent',
        isLoading: false,
      });

      render(<Header />);

      expect(screen.getByText('Ana Costa')).toBeInTheDocument();
      expect(screen.getByText('Agente')).toBeInTheDocument();
    });
  });

  describe('Estado de Loading', () => {
    it('deve renderizar mesmo quando profile está null', () => {
      mockUseUserRole.mockReturnValue({
        profile: null,
        role: null,
        isLoading: true,
      });

      render(<Header />);

      // Header deve renderizar mesmo sem dados
      const header = document.querySelector('header');
      expect(header).toBeInTheDocument();
    });
  });
});
