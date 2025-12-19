/**
 * DealDetailsModal Component Tests
 * Testes unitários para o modal de detalhes do negócio
 */

import { render, screen, fireEvent } from '@testing-library/react';
import { DealDetailsModal } from '@/components/deals/deal-details-modal';
import type { DealWithRelations } from '@/types/deal';

// Mock do date-fns
jest.mock('date-fns', () => ({
  format: jest.fn(() => '01/01/2024 às 10:00'),
}));

jest.mock('date-fns/locale/pt-BR', () => ({}));

// Mock dos componentes UI
jest.mock('@/components/ui/dialog', () => ({
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Dialog: ({ children, open }: any) => open ? <div data-testid="dialog">{children}</div> : null,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  DialogContent: ({ children }: any) => <div data-testid="dialog-content">{children}</div>,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  DialogHeader: ({ children }: any) => <div data-testid="dialog-header">{children}</div>,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  DialogTitle: ({ children }: any) => <div data-testid="dialog-title">{children}</div>,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  DialogFooter: ({ children }: any) => <div data-testid="dialog-footer">{children}</div>,
}));

jest.mock('@/components/ui/button', () => ({
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Button: ({ children, onClick, variant }: any) => (
    <button onClick={onClick} data-variant={variant} data-testid={`button-${variant || 'default'}`}>
      {children}
    </button>
  ),
}));

jest.mock('@/components/ui/badge', () => ({
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Badge: ({ children, variant }: any) => (
    <span data-testid={`badge-${variant}`} data-variant={variant}>
      {children}
    </span>
  ),
}));

jest.mock('@/components/ui/separator', () => ({
  Separator: () => <hr data-testid="separator" />,
}));

jest.mock('@/lib/format', () => ({
  formatCurrency: jest.fn((value) => `R$ ${value?.toLocaleString('pt-BR') || '0'}`),
}));

// Mock dos ícones do Lucide
jest.mock('lucide-react', () => ({
  Target: () => <span data-testid="icon-target">🎯</span>,
  DollarSign: () => <span data-testid="icon-dollar">💰</span>,
  User: () => <span data-testid="icon-user">👤</span>,
  Calendar: () => <span data-testid="icon-calendar">📅</span>,
  CheckCircle: () => <span data-testid="icon-check">✅</span>,
  XCircle: () => <span data-testid="icon-x">❌</span>,
  Clock: () => <span data-testid="icon-clock">🕐</span>,
}));

describe('DealDetailsModal', () => {
  const mockDeal: DealWithRelations = {
    id: '1',
    title: 'Negócio Teste',
    contact_id: 'contact-1',
    stage_id: 'stage-1',
    value: 10000,
    expected_close_date: '2024-12-31',
    assigned_to: 'user-1',
    position: 1,
    status: 'active',
    created_at: '2024-01-01T10:00:00Z',
    updated_at: '2024-01-02T10:00:00Z',
    contact: {
      id: 'contact-1',
      name: 'João Silva',
      email: 'joao@example.com',
    },
    stage: {
      id: 'stage-1',
      name: 'Proposta',
      color: '#3b82f6',
      order: 1,
    },
  };

  const mockProps = {
    deal: mockDeal,
    isOpen: true,
    onClose: jest.fn(),
    onEdit: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders deal details correctly', () => {
    render(<DealDetailsModal {...mockProps} />);

    expect(screen.getByTestId('dialog')).toBeInTheDocument();
    expect(screen.getByTestId('dialog-title')).toHaveTextContent('Negócio Teste');
    expect(screen.getByText('R$ 10.000')).toBeInTheDocument();
    expect(screen.getByText('João Silva')).toBeInTheDocument();
    expect(screen.getByText('Proposta')).toBeInTheDocument();
    expect(screen.getByTestId('badge-default')).toHaveTextContent('Ativo');
  });

  it('calls onClose when close button is clicked', () => {
    render(<DealDetailsModal {...mockProps} />);

    const closeButton = screen.getByTestId('button-outline');
    fireEvent.click(closeButton);

    expect(mockProps.onClose).toHaveBeenCalledTimes(1);
  });

  it('calls onEdit when edit button is clicked', () => {
    render(<DealDetailsModal {...mockProps} />);

    const editButton = screen.getByTestId('button-default');
    fireEvent.click(editButton);

    expect(mockProps.onEdit).toHaveBeenCalledWith(mockDeal);
    expect(mockProps.onClose).toHaveBeenCalledTimes(1);
  });

  it('does not render when deal is null', () => {
    render(<DealDetailsModal {...mockProps} deal={null} />);

    expect(screen.queryByTestId('dialog')).not.toBeInTheDocument();
  });

  it('does not render when isOpen is false', () => {
    render(<DealDetailsModal {...mockProps} isOpen={false} />);

    expect(screen.queryByTestId('dialog')).not.toBeInTheDocument();
  });

  it('renders contact email when available', () => {
    render(<DealDetailsModal {...mockProps} />);

    expect(screen.getByText('(joao@example.com)')).toBeInTheDocument();
  });

  it('renders expected close date when available', () => {
    render(<DealDetailsModal {...mockProps} />);

    expect(screen.getByText('Fechamento esperado')).toBeInTheDocument();
  });

  it('renders updated date when different from created date', () => {
    render(<DealDetailsModal {...mockProps} />);

    expect(screen.getByText('Última atualização')).toBeInTheDocument();
  });
});
