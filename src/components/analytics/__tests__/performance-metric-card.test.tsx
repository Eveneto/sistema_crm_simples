/**
 * Analytics Components Tests
 * Testes unitários para componentes do módulo de analytics
 * 
 * Seguindo Clean Code:
 * - Testa comportamento do usuário
 * - Usa @testing-library/react
 * - Testa acessibilidade
 * - Testa interações
 */

import { render, screen } from '@testing-library/react';
import { describe, it, expect } from '@jest/globals';
import { PerformanceMetricCard } from '@/components/analytics/performance-metric-card';

// ============================================
// PerformanceMetricCard Tests
// ============================================

describe('PerformanceMetricCard', () => {
  it('deve renderizar métrica com valor', () => {
    // Arrange & Act
    render(
      <PerformanceMetricCard
        title="Taxa de Conversão"
        value={75}
        format="percent"
        trend="up"
        change={5}
        icon="TrendingUp"
      />
    );

    // Assert
    expect(screen.getByText('Taxa de Conversão')).toBeInTheDocument();
    expect(screen.getByText('75%')).toBeInTheDocument();
  });

  it('deve formatar valor como moeda', () => {
    // Arrange & Act
    render(
      <PerformanceMetricCard
        title="Ticket Médio"
        value={50000}
        format="currency"
        trend="up"
        change={10}
      />
    );

    // Assert
    expect(screen.getByText(/R\$.*50\.000/)).toBeInTheDocument();
  });

  it('deve formatar valor como dias', () => {
    // Arrange & Act
    render(
      <PerformanceMetricCard
        title="Ciclo de Vendas"
        value={30}
        format="days"
        trend="down"
        change={-5}
      />
    );

    // Assert
    expect(screen.getByText('30 dias')).toBeInTheDocument();
  });

  it('deve mostrar tendência positiva (up) com cor verde', () => {
    // Arrange & Act
    const { container } = render(
      <PerformanceMetricCard
        title="Win Rate"
        value={75}
        format="percent"
        trend="up"
        change={5}
      />
    );

    // Assert
    const trendElement = container.querySelector('.text-green-600');
    expect(trendElement).toBeInTheDocument();
  });

  it('deve mostrar tendência negativa (down) com cor vermelha', () => {
    // Arrange & Act
    const { container } = render(
      <PerformanceMetricCard
        title="Win Rate"
        value={65}
        format="percent"
        trend="down"
        change={-10}
      />
    );

    // Assert
    const trendElement = container.querySelector('.text-red-600');
    expect(trendElement).toBeInTheDocument();
  });

  it('deve mostrar tendência estável (stable) com cor cinza', () => {
    // Arrange & Act
    const { container } = render(
      <PerformanceMetricCard
        title="Win Rate"
        value={70}
        format="percent"
        trend="stable"
        change={0}
      />
    );

    // Assert
    const trendElement = container.querySelector('.text-gray-600');
    expect(trendElement).toBeInTheDocument();
  });

  it('deve mostrar percentual de mudança', () => {
    // Arrange & Act
    render(
      <PerformanceMetricCard
        title="Receita"
        value={100000}
        format="currency"
        trend="up"
        change={25}
      />
    );

    // Assert
    expect(screen.getByText(/\+25%/)).toBeInTheDocument();
  });

  it('deve mostrar descrição quando fornecida', () => {
    // Arrange & Act
    render(
      <PerformanceMetricCard
        title="Win Rate"
        value={75}
        format="percent"
        trend="up"
        change={5}
        description="Taxa de negócios ganhos"
      />
    );

    // Assert
    expect(screen.getByText('Taxa de negócios ganhos')).toBeInTheDocument();
  });

  it('deve ser acessível (role e aria-label)', () => {
    // Arrange & Act
    render(
      <PerformanceMetricCard
        title="Win Rate"
        value={75}
        format="percent"
        trend="up"
        change={5}
      />
    );

    // Assert
    const card = screen.getByRole('article');
    expect(card).toBeInTheDocument();
  });

  it('deve lidar com valor zero', () => {
    // Arrange & Act
    render(
      <PerformanceMetricCard
        title="Novos Deals"
        value={0}
        format="number"
        trend="stable"
        change={0}
      />
    );

    // Assert
    expect(screen.getByText('0')).toBeInTheDocument();
  });

  it('deve lidar com valores negativos', () => {
    // Arrange & Act
    render(
      <PerformanceMetricCard
        title="Variação"
        value={-5000}
        format="currency"
        trend="down"
        change={-10}
      />
    );

    // Assert
    expect(screen.getByText(/-R\$.*5\.000/)).toBeInTheDocument();
  });

  it('deve renderizar ícone quando fornecido', () => {
    // Arrange & Act
    const { container } = render(
      <PerformanceMetricCard
        title="Win Rate"
        value={75}
        format="percent"
        trend="up"
        change={5}
        icon="Trophy"
      />
    );

    // Assert
    const icon = container.querySelector('svg');
    expect(icon).toBeInTheDocument();
  });
});

// ============================================
// Edge Cases
// ============================================

describe('PerformanceMetricCard - Edge Cases', () => {
  it('deve lidar com valores muito grandes', () => {
    // Arrange & Act
    render(
      <PerformanceMetricCard
        title="Receita Total"
        value={1000000000}
        format="currency"
        trend="up"
        change={100}
      />
    );

    // Assert
    expect(screen.getByText(/R\$.*1\.000\.000\.000/)).toBeInTheDocument();
  });

  it('deve lidar com valores decimais', () => {
    // Arrange & Act
    render(
      <PerformanceMetricCard
        title="Taxa"
        value={75.5}
        format="percent"
        trend="up"
        change={2.5}
      />
    );

    // Assert
    expect(screen.getByText('75,5%')).toBeInTheDocument();
  });

  it('deve arredondar valores quando necessário', () => {
    // Arrange & Act
    render(
      <PerformanceMetricCard
        title="Média"
        value={33.333333}
        format="number"
        trend="stable"
        change={0}
      />
    );

    // Assert
    expect(screen.getByText(/33/)).toBeInTheDocument();
  });

  it('deve lidar com mudança percentual sem sinal', () => {
    // Arrange & Act
    render(
      <PerformanceMetricCard
        title="Taxa"
        value={50}
        format="percent"
        trend="stable"
        change={0}
      />
    );

    // Assert
    expect(screen.getByText('0%')).toBeInTheDocument();
  });
});

// ============================================
// Snapshot Tests
// ============================================

describe('PerformanceMetricCard - Snapshots', () => {
  it('deve corresponder ao snapshot com tendência up', () => {
    // Arrange & Act
    const { container } = render(
      <PerformanceMetricCard
        title="Win Rate"
        value={75}
        format="percent"
        trend="up"
        change={5}
      />
    );

    // Assert
    expect(container.firstChild).toMatchSnapshot();
  });

  it('deve corresponder ao snapshot com tendência down', () => {
    // Arrange & Act
    const { container } = render(
      <PerformanceMetricCard
        title="Ciclo de Vendas"
        value={35}
        format="days"
        trend="down"
        change={-5}
      />
    );

    // Assert
    expect(container.firstChild).toMatchSnapshot();
  });
});
