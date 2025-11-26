import { render, screen } from '@testing-library/react';
import { ThemeToggle } from '../theme-toggle';

const mockUseTheme = jest.fn();

// Mock do next-themes
jest.mock('next-themes', () => ({
  useTheme: mockUseTheme,
}));

describe('ThemeToggle', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Renderização', () => {
    it('deve renderizar o botão de toggle', () => {
      mockUseTheme.mockReturnValue({
        theme: 'light',
        setTheme: jest.fn(),
      });

      render(<ThemeToggle />);

      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
    });

    it('deve renderizar no tema light', () => {
      mockUseTheme.mockReturnValue({
        theme: 'light',
        setTheme: jest.fn(),
      });

      render(<ThemeToggle />);

      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
    });

    it('deve renderizar no tema dark', () => {
      mockUseTheme.mockReturnValue({
        theme: 'dark',
        setTheme: jest.fn(),
      });

      render(<ThemeToggle />);

      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
    });

    it('deve renderizar no tema system', () => {
      mockUseTheme.mockReturnValue({
        theme: 'system',
        setTheme: jest.fn(),
      });

      render(<ThemeToggle />);

      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
    });
  });

  describe('Acessibilidade', () => {
    it('deve ter role button', () => {
      mockUseTheme.mockReturnValue({
        theme: 'light',
        setTheme: jest.fn(),
      });

      render(<ThemeToggle />);

      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('deve ser focável', () => {
      mockUseTheme.mockReturnValue({
        theme: 'light',
        setTheme: jest.fn(),
      });

      render(<ThemeToggle />);

      const button = screen.getByRole('button');
      button.focus();
      expect(button).toHaveFocus();
    });
  });
});
