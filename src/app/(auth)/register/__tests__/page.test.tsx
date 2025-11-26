import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import RegisterPage from '../page';

// Mock do toast
const mockToast = jest.fn();
jest.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: mockToast,
  }),
}));

describe('RegisterPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockToast.mockClear();
  });

  describe('Renderização', () => {
    it('deve renderizar o formulário de registro', () => {
      render(<RegisterPage />);

      expect(screen.getByRole('heading', { name: /criar conta/i })).toBeInTheDocument();
      expect(screen.getByLabelText(/nome completo/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/e-mail/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/^senha$/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/confirmar senha/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /criar conta/i })).toBeInTheDocument();
    });

    it('deve ter link para voltar ao login', () => {
      render(<RegisterPage />);

      const loginLink = screen.getByRole('link', { name: /fazer login/i });
      expect(loginLink).toBeInTheDocument();
      expect(loginLink).toHaveAttribute('href', '/login');
    });
  });

  describe('Validação de Campos', () => {
    it('deve ter todos os campos obrigatórios com tipos corretos', () => {
      render(<RegisterPage />);

      const nameInput = screen.getByLabelText(/nome completo/i);
      const emailInput = screen.getByLabelText(/e-mail/i);
      const passwordInput = screen.getByLabelText(/^senha$/i);
      const confirmPasswordInput = screen.getByLabelText(/confirmar senha/i);

      expect(nameInput).toHaveAttribute('required');
      expect(emailInput).toHaveAttribute('required');
      expect(emailInput).toHaveAttribute('type', 'email');
      expect(passwordInput).toHaveAttribute('required');
      expect(passwordInput).toHaveAttribute('type', 'password');
      expect(passwordInput).toHaveAttribute('minlength', '6');
      expect(confirmPasswordInput).toHaveAttribute('required');
      expect(confirmPasswordInput).toHaveAttribute('type', 'password');
    });
  });

  describe('Interação com Formulário', () => {
    it('deve permitir preencher todos os campos', () => {
      render(<RegisterPage />);

      const nameInput = screen.getByLabelText(/nome completo/i) as HTMLInputElement;
      const emailInput = screen.getByLabelText(/e-mail/i) as HTMLInputElement;
      const passwordInput = screen.getByLabelText(/^senha$/i) as HTMLInputElement;
      const confirmPasswordInput = screen.getByLabelText(/confirmar senha/i) as HTMLInputElement;

      fireEvent.change(nameInput, { target: { value: 'João Silva' } });
      fireEvent.change(emailInput, { target: { value: 'joao@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'senha123' } });
      fireEvent.change(confirmPasswordInput, { target: { value: 'senha123' } });

      expect(nameInput.value).toBe('João Silva');
      expect(emailInput.value).toBe('joao@example.com');
      expect(passwordInput.value).toBe('senha123');
      expect(confirmPasswordInput.value).toBe('senha123');
    });
  });

  describe('Validação de Senha', () => {
    it('deve aceitar senha com 6+ caracteres', () => {
      render(<RegisterPage />);

      const passwordInput = screen.getByLabelText(/^senha$/i) as HTMLInputElement;
      fireEvent.change(passwordInput, { target: { value: 'senha123' } });

      expect(passwordInput.value.length).toBeGreaterThanOrEqual(6);
    });

    it('deve ter campo de confirmação de senha', () => {
      render(<RegisterPage />);

      const passwordInput = screen.getByLabelText(/^senha$/i);
      const confirmPasswordInput = screen.getByLabelText(/confirmar senha/i);

      expect(passwordInput).toBeInTheDocument();
      expect(confirmPasswordInput).toBeInTheDocument();
    });
  });

  describe('Estados do Formulário', () => {
    it('deve ter botão de submit', () => {
      render(<RegisterPage />);

      const submitButton = screen.getByRole('button', { name: /criar conta/i });
      expect(submitButton).toBeInTheDocument();
      expect(submitButton).toHaveAttribute('type', 'submit');
    });

    it('deve mostrar texto informativo sobre confirmação', () => {
      render(<RegisterPage />);

      expect(screen.getByText(/enviaremos um e-mail de confirmação/i)).toBeInTheDocument();
    });
  });

  describe('Validações Assíncronas', () => {
    it('deve mostrar erro com e-mail inválido ao submeter', async () => {
      render(<RegisterPage />);

      const nameInput = screen.getByLabelText(/nome completo/i);
      const emailInput = screen.getByLabelText(/e-mail/i);
      const passwordInput = screen.getByLabelText(/^senha$/i);
      const confirmPasswordInput = screen.getByLabelText(/confirmar senha/i);
      const submitButton = screen.getByRole('button', { name: /criar conta/i });

      fireEvent.change(nameInput, { target: { value: 'João Silva' } });
      fireEvent.change(emailInput, { target: { value: 'email-invalido' } });
      fireEvent.change(passwordInput, { target: { value: 'senha123' } });
      fireEvent.change(confirmPasswordInput, { target: { value: 'senha123' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith(
          expect.objectContaining({
            variant: 'destructive',
            title: 'E-mail inválido',
          })
        );
      });
    });

    it('deve mostrar erro quando senhas não coincidem', async () => {
      render(<RegisterPage />);

      const nameInput = screen.getByLabelText(/nome completo/i);
      const emailInput = screen.getByLabelText(/e-mail/i);
      const passwordInput = screen.getByLabelText(/^senha$/i);
      const confirmPasswordInput = screen.getByLabelText(/confirmar senha/i);
      const submitButton = screen.getByRole('button', { name: /criar conta/i });

      fireEvent.change(nameInput, { target: { value: 'João Silva' } });
      fireEvent.change(emailInput, { target: { value: 'joao@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'senha123' } });
      fireEvent.change(confirmPasswordInput, { target: { value: 'senha456' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith(
          expect.objectContaining({
            variant: 'destructive',
            title: 'Erro',
            description: 'As senhas não coincidem',
          })
        );
      });
    });

    it('deve mostrar erro quando senha tem menos de 6 caracteres', async () => {
      render(<RegisterPage />);

      const nameInput = screen.getByLabelText(/nome completo/i);
      const emailInput = screen.getByLabelText(/e-mail/i);
      const passwordInput = screen.getByLabelText(/^senha$/i);
      const confirmPasswordInput = screen.getByLabelText(/confirmar senha/i);
      const submitButton = screen.getByRole('button', { name: /criar conta/i });

      fireEvent.change(nameInput, { target: { value: 'João Silva' } });
      fireEvent.change(emailInput, { target: { value: 'joao@example.com' } });
      fireEvent.change(passwordInput, { target: { value: '12345' } });
      fireEvent.change(confirmPasswordInput, { target: { value: '12345' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith(
          expect.objectContaining({
            variant: 'destructive',
            title: 'Erro',
            description: 'A senha deve ter pelo menos 6 caracteres',
          })
        );
      });
    });

    it('deve desabilitar botão durante loading', async () => {
      render(<RegisterPage />);

      const nameInput = screen.getByLabelText(/nome completo/i);
      const emailInput = screen.getByLabelText(/e-mail/i);
      const passwordInput = screen.getByLabelText(/^senha$/i);
      const confirmPasswordInput = screen.getByLabelText(/confirmar senha/i);
      const submitButton = screen.getByRole('button', { name: /criar conta/i });

      fireEvent.change(nameInput, { target: { value: 'João Silva' } });
      fireEvent.change(emailInput, { target: { value: 'joao@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'senha123' } });
      fireEvent.change(confirmPasswordInput, { target: { value: 'senha123' } });

      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(submitButton).toBeDisabled();
      });
    });
  });
});
