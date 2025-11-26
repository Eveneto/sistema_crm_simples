import { render, screen, fireEvent } from '@testing-library/react';
import LoginPage from '../page';

// Mock do toast
jest.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: jest.fn(),
  }),
}));

describe('LoginPage', () => {
  it('deve renderizar o formulário de login', () => {
    render(<LoginPage />);

    expect(screen.getByText('CRM Simplificado')).toBeInTheDocument();
    expect(screen.getByLabelText(/e-mail/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/senha/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /entrar/i })).toBeInTheDocument();
  });

  it('deve ter campos com atributos corretos', () => {
    render(<LoginPage />);

    const emailInput = screen.getByLabelText(/e-mail/i);
    const passwordInput = screen.getByLabelText(/senha/i);

    expect(emailInput).toHaveAttribute('type', 'email');
    expect(emailInput).toHaveAttribute('required');
    expect(passwordInput).toHaveAttribute('type', 'password');
    expect(passwordInput).toHaveAttribute('required');
  });

  it('deve ter link para registro', () => {
    render(<LoginPage />);

    const registerLink = screen.getByRole('link', { name: /cadastre-se/i });
    expect(registerLink).toBeInTheDocument();
    expect(registerLink).toHaveAttribute('href', '/register');
  });

  it('deve ter link para recuperação de senha', () => {
    render(<LoginPage />);

    const resetLink = screen.getByRole('link', { name: /esqueceu sua senha/i });
    expect(resetLink).toBeInTheDocument();
    expect(resetLink).toHaveAttribute('href', '/reset-password');
  });

  it('deve permitir digitar no campo de e-mail', () => {
    render(<LoginPage />);

    const emailInput = screen.getByLabelText(/e-mail/i) as HTMLInputElement;
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });

    expect(emailInput.value).toBe('test@example.com');
  });

  it('deve permitir digitar no campo de senha', () => {
    render(<LoginPage />);

    const passwordInput = screen.getByLabelText(/senha/i) as HTMLInputElement;
    fireEvent.change(passwordInput, { target: { value: 'password123' } });

    expect(passwordInput.value).toBe('password123');
  });

  it('deve ter botão de submit com tipo correto', () => {
    render(<LoginPage />);

    const submitButton = screen.getByRole('button', { name: /entrar/i });
    expect(submitButton).toHaveAttribute('type', 'submit');
  });

  it('deve ter placeholder nos campos', () => {
    render(<LoginPage />);

    const emailInput = screen.getByLabelText(/e-mail/i);
    const passwordInput = screen.getByLabelText(/senha/i);

    expect(emailInput).toHaveAttribute('placeholder');
    expect(passwordInput).toHaveAttribute('placeholder');
  });

  it('deve ter autocomplete configurado', () => {
    render(<LoginPage />);

    const emailInput = screen.getByLabelText(/e-mail/i);
    const passwordInput = screen.getByLabelText(/senha/i);

    expect(emailInput).toHaveAttribute('autocomplete', 'email');
    expect(passwordInput).toHaveAttribute('autocomplete', 'current-password');
  });

  it('deve limpar campos após entrada', () => {
    render(<LoginPage />);

    const emailInput = screen.getByLabelText(/e-mail/i) as HTMLInputElement;
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    expect(emailInput.value).toBe('test@example.com');

    fireEvent.change(emailInput, { target: { value: '' } });
    expect(emailInput.value).toBe('');
  });
});
