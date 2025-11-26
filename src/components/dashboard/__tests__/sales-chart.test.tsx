import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SalesChart } from '../sales-chart';

// Mock do fetch global
global.fetch = jest.fn();

describe('SalesChart', () => {
  const mockSalesData = {
    data: [
      { date: '2024-01-01', value: 15000, count: 3 },
      { date: '2024-01-02', value: 22000, count: 5 },
      { date: '2024-01-03', value: 18000, count: 4 },
    ],
    period: '30d',
    granularity: 'daily',
    total: 55000,
  };

  beforeEach(() => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => mockSalesData,
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('deve renderizar o componente com título e descrição', async () => {
    render(<SalesChart />);

    expect(screen.getByText('Vendas ao Longo do Tempo')).toBeInTheDocument();
    expect(screen.getByText('Evolução das vendas fechadas')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.queryByText('Carregando dados...')).not.toBeInTheDocument();
    });
  });

  it('deve buscar dados da API ao montar', async () => {
    render(<SalesChart />);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/dashboard/sales?period=30d&granularity=daily'
      );
    });
  });

  it('deve exibir loading state durante o carregamento', () => {
    (global.fetch as jest.Mock).mockImplementation(
      () => new Promise(() => {}) // Promise que nunca resolve
    );

    render(<SalesChart />);

    expect(screen.getByText('Carregando dados...')).toBeInTheDocument();
  });

  it('deve exibir erro quando a API falha', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      json: async () => ({ error: 'Failed to fetch' }),
    });

    render(<SalesChart />);

    await waitFor(() => {
      expect(screen.getByText(/Erro ao carregar dados/)).toBeInTheDocument();
    });
  });

  it('deve exibir mensagem quando não há dados', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ ...mockSalesData, data: [] }),
    });

    render(<SalesChart />);

    await waitFor(() => {
      expect(screen.getByText('Nenhuma venda encontrada')).toBeInTheDocument();
      expect(screen.getByText('Não há dados para o período selecionado')).toBeInTheDocument();
    });
  });

  it('deve renderizar botões de período', async () => {
    render(<SalesChart />);

    expect(screen.getByText('7 dias')).toBeInTheDocument();
    expect(screen.getByText('30 dias')).toBeInTheDocument();
    expect(screen.getByText('90 dias')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.queryByText('Carregando dados...')).not.toBeInTheDocument();
    });
  });

  it('deve renderizar botões de granularidade', async () => {
    render(<SalesChart />);

    expect(screen.getByText('Diário')).toBeInTheDocument();
    expect(screen.getByText('Semanal')).toBeInTheDocument();
    expect(screen.getByText('Mensal')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.queryByText('Carregando dados...')).not.toBeInTheDocument();
    });
  });

  it('deve buscar novos dados ao mudar o período', async () => {
    const user = userEvent.setup();
    render(<SalesChart />);

    await waitFor(() => {
      expect(screen.queryByText('Carregando dados...')).not.toBeInTheDocument();
    });

    const button7d = screen.getByText('7 dias');
    await user.click(button7d);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/dashboard/sales?period=7d&granularity=daily');
    });
  });

  it('deve buscar novos dados ao mudar a granularidade', async () => {
    const user = userEvent.setup();
    render(<SalesChart />);

    await waitFor(() => {
      expect(screen.queryByText('Carregando dados...')).not.toBeInTheDocument();
    });

    const buttonWeekly = screen.getByText('Semanal');
    await user.click(buttonWeekly);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/dashboard/sales?period=30d&granularity=weekly'
      );
    });
  });
});
