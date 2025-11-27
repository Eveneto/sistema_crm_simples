import { render, screen } from '@testing-library/react';
import { TrendIndicator } from '../trend-indicator';

describe('TrendIndicator', () => {
  it('deve mostrar tendência positiva com cor verde', () => {
    render(<TrendIndicator value={15.5} isPositive={true} />);

    const trendText = screen.getByText(/15\.5%/);
    expect(trendText).toBeInTheDocument();
    expect(trendText.className).toContain('text-green-600');
  });

  it('deve mostrar tendência negativa com cor vermelha', () => {
    render(<TrendIndicator value={8.2} isPositive={false} />);

    const trendText = screen.getByText(/8\.2%/);
    expect(trendText).toBeInTheDocument();
    expect(trendText.className).toContain('text-red-600');
  });

  it('deve mostrar seta para cima quando positivo', () => {
    render(<TrendIndicator value={10} isPositive={true} />);

    expect(screen.getByText(/↑/)).toBeInTheDocument();
  });

  it('deve mostrar seta para baixo quando negativo', () => {
    render(<TrendIndicator value={10} isPositive={false} />);

    expect(screen.getByText(/↓/)).toBeInTheDocument();
  });

  it('deve permitir ocultar seta', () => {
    render(<TrendIndicator value={10} isPositive={true} showIcon={false} />);

    expect(screen.queryByText(/↑/)).not.toBeInTheDocument();
    expect(screen.getByText(/10\.0%/)).toBeInTheDocument();
  });

  it('deve permitir customizar label', () => {
    render(<TrendIndicator value={10} isPositive={true} label="comparado ao mês passado" />);

    expect(screen.getByText('comparado ao mês passado')).toBeInTheDocument();
  });

  it('deve permitir tamanho médio', () => {
    const { container } = render(<TrendIndicator value={10} isPositive={true} size="md" />);

    const trendText = container.querySelector('.text-sm');
    expect(trendText).toBeInTheDocument();
  });
});
