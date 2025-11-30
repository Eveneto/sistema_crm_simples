/**
 * Testes para DealForm (US-039)
 *
 * 4 testes críticos:
 * 1. Renderização do formulário com todos os campos
 * 2. Validação de campos obrigatórios
 * 3. Submit com sucesso
 * 4. Exibir erro de API
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { DealForm } from '../deal-form';
import type { PipelineStage } from '@/types/deal';

// Mock do useToast
const mockToast = jest.fn();
jest.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: mockToast,
  }),
}));

// Mock do ContactAutocomplete
jest.mock('../contact-autocomplete', () => ({
  ContactAutocomplete: ({ value, onSelect, disabled }: {
    value?: string;
    onSelect: (contactId: string) => void;
    disabled?: boolean;
  }) => (
    <div data-testid="contact-autocomplete">
      <input
        type="text"
        value={value || ''}
        onChange={(e) => onSelect(e.target.value)}
        disabled={disabled}
        placeholder="Selecionar contato..."
        data-testid="contact-input"
      />
    </div>
  ),
}));

// Mock data
const mockStages: PipelineStage[] = [
  {
    id: 'stage-1',
    name: 'Qualificação',
    color: '#3b82f6',
    order: 1,
    deals: [],
    count: 0,
    totalValue: 0,
  },
  {
    id: 'stage-2',
    name: 'Proposta',
    color: '#10b981',
    order: 2,
    deals: [],
    count: 0,
    totalValue: 0,
  },
];

const mockOnSuccess = jest.fn();
const mockOnCancel = jest.fn();

describe('DealForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Mock fetch
    global.fetch = jest.fn();
  });

  it('deve renderizar o formulário com todos os campos', () => {
    render(
      <DealForm
        mode="create"
        stages={mockStages}
        onSuccess={mockOnSuccess}
        onCancel={mockOnCancel}
      />
    );

    expect(screen.getByLabelText(/título/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/valor/i)).toBeInTheDocument();
    expect(screen.getByTestId('contact-autocomplete')).toBeInTheDocument();
    expect(screen.getByLabelText(/estágio/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/data esperada/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/descrição/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /criar negócio/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /cancelar/i })).toBeInTheDocument();
  });

  it('deve exibir erros quando campos obrigatórios estão vazios', async () => {
    render(
      <DealForm
        mode="create"
        stages={mockStages}
        onSuccess={mockOnSuccess}
        onCancel={mockOnCancel}
      />
    );

    // Fechar o select de estágio que abre automaticamente
    const stageSelect = screen.getByRole('combobox', { name: /estágio/i });
    fireEvent.click(stageSelect); // Fecha o dropdown

    const submitButton = screen.getByRole('button', { name: /criar negócio/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/título é obrigatório/i)).toBeInTheDocument();
      expect(screen.getByText(/contato é obrigatório/i)).toBeInTheDocument();
      // Removendo teste do estágio pois tem valor padrão
    });
  });

  it('deve criar negócio com sucesso', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ deal: { id: 'deal-1' } }),
    });

    render(
      <DealForm
        mode="create"
        stages={mockStages}
        onSuccess={mockOnSuccess}
        onCancel={mockOnCancel}
      />
    );

    // Preencher campos obrigatórios
    fireEvent.change(screen.getByLabelText(/título/i), {
      target: { value: 'Novo Negócio Teste' },
    });

    fireEvent.change(screen.getByTestId('contact-autocomplete').querySelector('input')!, {
      target: { value: 'contact-1' },
    });

    fireEvent.change(screen.getByLabelText(/valor/i), {
      target: { value: '10000' },
    });

    // Submeter
    const submitButton = screen.getByRole('button', { name: /criar negócio/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/deals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: 'Novo Negócio Teste',
          contact_id: 'contact-1',
          stage_id: 'stage-1',
          value: 10000,
          expected_close_date: '',
          description: '',
        }),
      });
      expect(mockToast).toHaveBeenCalledWith({
        title: 'Sucesso',
        description: 'Negócio criado com sucesso!',
      });
      expect(mockOnSuccess).toHaveBeenCalled();
    });
  });

  it('deve exibir erro quando API falha', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      json: () => Promise.resolve({ error: 'Erro ao criar negócio' }),
    });

    render(
      <DealForm
        mode="create"
        stages={mockStages}
        onSuccess={mockOnSuccess}
        onCancel={mockOnCancel}
      />
    );

    // Preencher campos obrigatórios
    fireEvent.change(screen.getByLabelText(/título/i), {
      target: { value: 'Novo Negócio Teste' },
    });

    fireEvent.change(screen.getByTestId('contact-autocomplete').querySelector('input')!, {
      target: { value: 'contact-1' },
    });

    fireEvent.change(screen.getByLabelText(/valor/i), {
      target: { value: '10000' },
    });

    // Submeter
    const submitButton = screen.getByRole('button', { name: /criar negócio/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith({
        title: 'Erro',
        description: 'Erro ao criar negócio',
        variant: 'destructive',
      });
      expect(mockOnSuccess).not.toHaveBeenCalled();
    });
  });
});
