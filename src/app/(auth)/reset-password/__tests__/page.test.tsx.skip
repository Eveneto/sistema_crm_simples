import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ResetPasswordPage from '../page';

const mockToast = jest.fn();

// Mock do toast
jest.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: mockToast,
  }),
}));

describe('ResetPasswordPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Renderização', () => {
    it('deve renderizar o formulário de recuperação de senha', () => {
      render(<ResetPasswordPage />);

      expect(screen.getByText(/recuperar senha/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/e-mail/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /enviar/i })).toBeInTheDocument();
    });

    it('deve mostrar mensagem explicativa', () => {
      render(<ResetPasswordPage />);

      // Verifica se existe texto informativo sobre o processo
      const pageContent = screen.getByRole('heading', { name: /recuperar senha/i });
      expect(pageContent).toBeInTheDocument();
    });

    it('deve ter link para voltar ao login', () => {
      render(<ResetPasswordPage />);

      const loginLink = screen.getByRole('link', { name: /voltar/i });
      expect(loginLink).toBeInTheDocument();
      expect(loginLink).toHaveAttribute('href', '/login');
    });
  });

  describe('Validação de Campos', () => {
    it('deve validar campo e-mail obrigatório', () => {
      render(<ResetPasswordPage />);

      const emailInput = screen.getByLabelText(/e-mail/i);
      expect(emailInput).toHaveAttribute('required');
      expect(emailInput).toHaveAttribute('type', 'email');
    });

    it('deve ter placeholder no campo e-mail', () => {
      render(<ResetPasswordPage />);

      const emailInput = screen.getByLabelText(/e-mail/i);
      expect(emailInput).toHaveAttribute('placeholder');
    });
  });

  describe('Interação com Formulário', () => {
    it('deve permitir digitar no campo e-mail', () => {
      render(<ResetPasswordPage />);

      const emailInput = screen.getByLabelText(/e-mail/i) as HTMLInputElement;
      fireEvent.change(emailInput, { target: { value: 'user@example.com' } });

      expect(emailInput.value).toBe('user@example.com');
    });

    it('deve ter botão de submit com tipo correto', () => {
      render(<ResetPasswordPage />);

      const submitButton = screen.getByRole('button', { name: /enviar/i });
      expect(submitButton).toHaveAttribute('type', 'submit');
    });

    it('deve limpar campo após digitação e limpeza', () => {
      render(<ResetPasswordPage />);

      const emailInput = screen.getByLabelText(/e-mail/i) as HTMLInputElement;
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      expect(emailInput.value).toBe('test@example.com');

      fireEvent.change(emailInput, { target: { value: '' } });
      expect(emailInput.value).toBe('');
    });
  });

  describe('Layout e Acessibilidade', () => {
    it('deve ter título da página', () => {
      render(<ResetPasswordPage />);

      const heading = screen.getByRole('heading', { name: /recuperar senha/i });
      expect(heading).toBeInTheDocument();
    });

    it('deve ter formulário acessível', () => {
      render(<ResetPasswordPage />);

      const form = screen.getByRole('button', { name: /enviar/i }).closest('form');
      expect(form).toBeInTheDocument();
    });
  });

  describe('Validações Assíncronas', () => {
    it('deve mostrar erro com e-mail inválido', async () => {
      render(<ResetPasswordPage />);

      const emailInput = screen.getByLabelText(/e-mail/i);
      const submitButton = screen.getByRole('button', { name: /enviar/i });

      fireEvent.change(emailInput, { target: { value: 'email-invalido' } });
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

    it('deve desabilitar botão durante loading', async () => {
      render(<ResetPasswordPage />);

      const emailInput = screen.getByLabelText(/e-mail/i);
      const submitButton = screen.getByRole('button', { name: /enviar/i });

      fireEvent.change(emailInput, { target: { value: 'user@example.com' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(submitButton).toBeDisabled();
      });
    });
  });
});
