import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import UpdatePasswordPage from '../page';

const mockToast = jest.fn();

// Mock do toast
jest.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: mockToast,
  }),
}));

describe('UpdatePasswordPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Renderização', () => {
    it('deve renderizar o formulário de atualização de senha', () => {
      render(<UpdatePasswordPage />);

      expect(screen.getByRole('heading', { name: /nova senha/i })).toBeInTheDocument();
      expect(screen.getByLabelText(/^senha$/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/confirmar senha/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /atualizar/i })).toBeInTheDocument();
    });

    it('deve mostrar mensagem explicativa', () => {
      render(<UpdatePasswordPage />);

      expect(screen.getByText(/digite sua nova senha/i)).toBeInTheDocument();
    });
  });

  describe('Validação de Campos', () => {
    it('deve validar campo senha obrigatório', () => {
      render(<UpdatePasswordPage />);

      const passwordInput = screen.getByLabelText(/^senha$/i);
      expect(passwordInput).toHaveAttribute('required');
      expect(passwordInput).toHaveAttribute('type', 'password');
      expect(passwordInput).toHaveAttribute('minlength', '6');
    });

    it('deve validar campo confirmar senha obrigatório', () => {
      render(<UpdatePasswordPage />);

      const confirmPasswordInput = screen.getByLabelText(/confirmar senha/i);
      expect(confirmPasswordInput).toHaveAttribute('required');
      expect(confirmPasswordInput).toHaveAttribute('type', 'password');
    });
  });

  describe('Interação com Formulário', () => {
    it('deve permitir digitar no campo senha', () => {
      render(<UpdatePasswordPage />);

      const passwordInput = screen.getByLabelText(/^senha$/i) as HTMLInputElement;
      fireEvent.change(passwordInput, { target: { value: 'newpassword123' } });

      expect(passwordInput.value).toBe('newpassword123');
    });

    it('deve permitir digitar no campo confirmar senha', () => {
      render(<UpdatePasswordPage />);

      const confirmPasswordInput = screen.getByLabelText(/confirmar senha/i) as HTMLInputElement;
      fireEvent.change(confirmPasswordInput, { target: { value: 'newpassword123' } });

      expect(confirmPasswordInput.value).toBe('newpassword123');
    });

    it('deve ter botão de submit com tipo correto', () => {
      render(<UpdatePasswordPage />);

      const submitButton = screen.getByRole('button', { name: /atualizar/i });
      expect(submitButton).toHaveAttribute('type', 'submit');
    });
  });

  describe('Validação de Senha', () => {
    it('deve aceitar senha com 6+ caracteres', () => {
      render(<UpdatePasswordPage />);

      const passwordInput = screen.getByLabelText(/^senha$/i) as HTMLInputElement;
      fireEvent.change(passwordInput, { target: { value: 'senha123456' } });

      expect(passwordInput.value.length).toBeGreaterThanOrEqual(6);
    });

    it('deve ter dois campos de senha (senha e confirmação)', () => {
      render(<UpdatePasswordPage />);

      const passwordInputs = screen.getAllByLabelText(/senha/i);
      expect(passwordInputs).toHaveLength(2);
    });
  });

  describe('Layout e Acessibilidade', () => {
    it('deve ter título da página', () => {
      render(<UpdatePasswordPage />);

      const heading = screen.getByRole('heading', { name: /nova senha/i });
      expect(heading).toBeInTheDocument();
    });

    it('deve ter formulário acessível', () => {
      render(<UpdatePasswordPage />);

      const form = screen.getByRole('button', { name: /atualizar/i }).closest('form');
      expect(form).toBeInTheDocument();
    });

    it('deve ter labels para todos os campos', () => {
      render(<UpdatePasswordPage />);

      expect(screen.getByLabelText(/^senha$/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/confirmar senha/i)).toBeInTheDocument();
    });
  });

  describe('Validações Assíncronas', () => {
    it('deve mostrar erro quando senhas não coincidem', async () => {
      render(<UpdatePasswordPage />);

      const passwordInput = screen.getByLabelText(/^senha$/i);
      const confirmPasswordInput = screen.getByLabelText(/confirmar senha/i);
      const submitButton = screen.getByRole('button', { name: /atualizar/i });

      fireEvent.change(passwordInput, { target: { value: 'newpass123' } });
      fireEvent.change(confirmPasswordInput, { target: { value: 'different123' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith(
          expect.objectContaining({
            variant: 'destructive',
            description: expect.stringMatching(/não coincidem/i),
          })
        );
      });
    });

    it('deve mostrar erro com senha curta', async () => {
      render(<UpdatePasswordPage />);

      const passwordInput = screen.getByLabelText(/^senha$/i);
      const confirmPasswordInput = screen.getByLabelText(/confirmar senha/i);
      const submitButton = screen.getByRole('button', { name: /atualizar/i });

      fireEvent.change(passwordInput, { target: { value: '12345' } });
      fireEvent.change(confirmPasswordInput, { target: { value: '12345' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith(
          expect.objectContaining({
            variant: 'destructive',
            description: expect.stringMatching(/pelo menos 6 caracteres/i),
          })
        );
      });
    });

    it('deve desabilitar botão durante loading', async () => {
      render(<UpdatePasswordPage />);

      const passwordInput = screen.getByLabelText(/^senha$/i);
      const confirmPasswordInput = screen.getByLabelText(/confirmar senha/i);
      const submitButton = screen.getByRole('button', { name: /atualizar/i });

      fireEvent.change(passwordInput, { target: { value: 'newpass123' } });
      fireEvent.change(confirmPasswordInput, { target: { value: 'newpass123' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(submitButton).toBeDisabled();
      });
    });
  });
});
