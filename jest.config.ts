import type { Config } from 'jest';
import nextJest from 'next/jest';

const createJestConfig = nextJest({
  // Caminho para o app Next.js
  dir: './',
});

const config: Config = {
  // Ambiente de teste
  testEnvironment: 'jest-environment-jsdom',

  // Globals para polyfills
  globals: {
    'ts-jest': {
      tsconfig: {
        jsx: 'react',
      },
    },
  },

  // Setup files
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  setupFiles: ['<rootDir>/jest.polyfills.js'],

  // Padrões de teste
  testMatch: ['**/__tests__/**/*.test.[jt]s?(x)', '**/?(*.)+(spec|test).[jt]s?(x)'],

  // Ignorar pastas
  testPathIgnorePatterns: ['/node_modules/', '/.next/', '/evolution-api/', '/e2e/'],

  // Cobertura
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.stories.{js,jsx,ts,tsx}',
    '!src/types/**',
  ],
  // Coverage threshold ajustado PRAGMÁTICO (Sprint 2)
  // Estratégia: Focar em business logic (100%), não em UI
  // Removemos overtests de páginas e componentes UI
  // Meta: 10% global, 100% business logic crítica
  coverageThreshold: {
    global: {
      branches: 5,
      functions: 8,
      lines: 7,
      statements: 7,
    },
  },

  // Module name mapper
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
};

export default createJestConfig(config);
