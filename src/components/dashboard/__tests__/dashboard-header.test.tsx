import { render, screen, fireEvent } from '@testing-library/react';
import { DashboardHeader } from '../dashboard-header';

describe('DashboardHeader', () => {
  it('deve renderizar header', () => {
    render(<DashboardHeader />);

    // Verifica se renderiza o título
    expect(screen.getByText('Bem-vindo de volta!')).toBeInTheDocument();
  });

  it('deve renderizar botões de período', () => {
    render(<DashboardHeader />);

    expect(screen.getByText('7 dias')).toBeInTheDocument();
    expect(screen.getByText('30 dias')).toBeInTheDocument();
    expect(screen.getByText('90 dias')).toBeInTheDocument();
  });

  it('deve chamar onPeriodChange ao clicar em botão', () => {
    const mockOnChange = jest.fn();
    render(<DashboardHeader onPeriodChange={mockOnChange} />);

    const button7d = screen.getByText('7 dias');
    fireEvent.click(button7d);

    expect(mockOnChange).toHaveBeenCalledWith('7d');
  });

  it('deve marcar botão 30d como selecionado por padrão', () => {
    render(<DashboardHeader />);

    const button30d = screen.getByText('30 dias');

    // Botão selecionado tem classe bg-primary
    expect(button30d.className).toContain('bg-primary');
  });
});
