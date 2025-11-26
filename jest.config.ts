import type { Config } from 'jest';
import nextJest from 'next/jest';

const createJestConfig = nextJest({
  // Caminho para o app Next.js
  dir: './',
});

const config: Config = {
  // Ambiente de teste
  testEnvironment: 'jest-environment-jsdom',

  // Setup files
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],

  // Padrões de teste
  testMatch: ['**/__tests__/**/*.test.[jt]s?(x)', '**/?(*.)+(spec|test).[jt]s?(x)'],

  // Ignorar pastas
  testPathIgnorePatterns: ['/node_modules/', '/.next/', '/evolution-api/'],

  // Cobertura
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.stories.{js,jsx,ts,tsx}',
    '!src/types/**',
  ],
  // Coverage threshold ajustado para MVP (realista)
  // Meta: 30% global, 90%+ business logic
  // Ajuste temporário para CI (Sprint 2 Dia 1)
  coverageThreshold: {
    global: {
      branches: 10,
      functions: 20,
      lines: 30,
      statements: 30,
    },
  },

  // Module name mapper
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
};

export default createJestConfig(config);
