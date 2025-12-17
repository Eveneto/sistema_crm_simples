/**
 * Retry logic with exponential backoff for API calls
 * Automatically retries failed requests with increasing delays
 */

export interface RetryOptions {
  maxAttempts?: number;
  initialDelayMs?: number;
  maxDelayMs?: number;
  backoffMultiplier?: number;
  onRetry?: (attempt: number, delay: number, error: Error) => void;
}

const DEFAULT_OPTIONS: Required<RetryOptions> = {
  maxAttempts: 3,
  initialDelayMs: 1000,
  maxDelayMs: 10000,
  backoffMultiplier: 2,
  onRetry: () => {},
};

/**
 * Executa uma função com retry automático
 * @param fn Função a ser executada
 * @param options Opções de retry
 * @returns Resultado da função
 */
export async function withRetry<T>(fn: () => Promise<T>, options: RetryOptions = {}): Promise<T> {
  const config = { ...DEFAULT_OPTIONS, ...options };

  let lastError: Error | null = null;
  let delay = config.initialDelayMs;

  for (let attempt = 1; attempt <= config.maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      if (attempt === config.maxAttempts) {
        throw lastError;
      }

      config.onRetry(attempt, delay, lastError);
      await new Promise((resolve) => setTimeout(resolve, delay));

      // Exponential backoff com jitter
      delay = Math.min(delay * config.backoffMultiplier + Math.random() * 1000, config.maxDelayMs);
    }
  }

  throw lastError;
}

/**
 * Fetch wrapper com retry automático
 */
export async function fetchWithRetry(
  url: string,
  options: RequestInit = {},
  retryOptions: RetryOptions = {}
): Promise<Response> {
  return withRetry(
    () =>
      fetch(url, options).then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        return response;
      }),
    retryOptions
  );
}

/**
 * Hook para usar retry em React Query
 */
export function getQueryRetryConfig(options: RetryOptions = {}) {
  const config = { ...DEFAULT_OPTIONS, ...options };

  return {
    retry: (failureCount: number, error: unknown) => {
      // Não retenta em erros 4xx (exceto 408, 429)
      const status = (error as Record<string, unknown>)?.status;
      if (typeof status === 'number' && status >= 400 && status < 500) {
        if (status !== 408 && status !== 429) {
          return false;
        }
      }

      // Retenta até maxAttempts
      return failureCount < config.maxAttempts;
    },
    retryDelay: (attemptIndex: number) => {
      let delay = config.initialDelayMs * Math.pow(config.backoffMultiplier, attemptIndex);
      delay = Math.min(delay, config.maxDelayMs);
      // Adiciona jitter para evitar thundering herd
      return delay + Math.random() * 1000;
    },
  };
}
