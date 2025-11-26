import '@testing-library/jest-dom';

// Mock do window.matchMedia (necessário para testes com Radix UI)
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Suppress console errors in tests (opcional)
global.console = {
  ...console,
  error: jest.fn(),
  warn: jest.fn(),
};
