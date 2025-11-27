import { render, screen } from '@testing-library/react';
import { KPICard } from '../kpi-card';
import { Users } from 'lucide-react';

describe('KPICard', () => {
  it('deve renderizar título e valor', () => {
    render(<KPICard title="Total de Contatos" value="150" icon={Users} />);

    expect(screen.getByText('Total de Contatos')).toBeInTheDocument();
    expect(screen.getByText('150')).toBeInTheDocument();
  });

  it('deve mostrar tendência com seta para cima', () => {
    render(
      <KPICard
        title="Contatos"
        value="100"
        icon={Users}
        trend={{ value: 15.5, isPositive: true }}
      />
    );

    // Verifica que o valor da tendência está presente
    expect(screen.getByText(/15\.5/)).toBeInTheDocument();
    // Verifica que tem a seta para cima
    expect(screen.getByText(/↑/)).toBeInTheDocument();
  });

  it('deve mostrar tendência com seta para baixo', () => {
    render(
      <KPICard
        title="Contatos"
        value="100"
        icon={Users}
        trend={{ value: 8.2, isPositive: false }}
      />
    );

    // Verifica que o valor da tendência está presente
    expect(screen.getByText(/8\.2/)).toBeInTheDocument();
    // Verifica que tem a seta para baixo
    expect(screen.getByText(/↓/)).toBeInTheDocument();
  });

  it('deve mostrar skeleton quando loading', () => {
    const { container } = render(
      <KPICard title="Contatos" value="100" icon={Users} isLoading={true} />
    );

    // Skeleton tem classe animate-pulse
    const skeleton = container.querySelector('.animate-pulse');
    expect(skeleton).toBeInTheDocument();
  });
});
