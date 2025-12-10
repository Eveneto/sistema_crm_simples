import { QueryClient } from '@tanstack/react-query';

/**
 * React Query Client Configuration
 * 
 * Configuração global de cache, retry, e comportamento de queries
 * 
 * @see https://tanstack.com/query/latest/docs/react/guides/caching
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      /**
       * STALE TIME: Quanto tempo antes de marcar como "stale" (obsoleto)
       * 
       * Exemplos:
       * - Contatos: 5 min (mudam menos frequentemente)
       * - Conversas: 2 min (mudam mais rápido)
       * - Mensagens: 1 min (chegam constantemente)
       * - Dashboard: 10 min (métricas mudam pouco)
       * 
       * Enquanto em "fresh", fetch não é feito mesmo refocando janela
       */
      staleTime: 5 * 60 * 1000, // 5 minutos padrão

      /**
       * GC TIME (garbage collection): Quanto tempo manter dados em cache
       * depois que não são mais usados
       * 
       * Deixar em 30 min para poder refetch rápido se voltar para página
       */
      gcTime: 30 * 60 * 1000, // 30 minutos padrão

      /**
       * REFETCH ON WINDOW FOCUS: Refetch quando janela volta ao foco
       * 
       * Útil para mostrar dados frescos quando usuário volta
       * Ex: usuário abriu conversa, deixou aberta, volta depois de 10 min
       * 
       * Será feito fetch se passou do staleTime
       */
      refetchOnWindowFocus: true,

      /**
       * REFETCH ON RECONNECT: Refetch quando reconecta à internet
       * 
       * Se usuário ficou offline, quando reconectar faz refetch
       */
      refetchOnReconnect: true,

      /**
       * RETRY: Número de tentativas em caso de erro
       * 
       * 1 retry é padrão. Se falhar 2x, mostra erro
       */
      retry: 1,

      /**
       * RETRY DELAY: Delay entre retries em ms
       */
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),

      /**
       * NETWORK MODE: 'always' | 'online' | 'always'
       * 
       * 'always': faz fetch mesmo offline (útil para offline-first apps)
       * 'online': só faz fetch se online
       */
      networkMode: 'always',
    },

    mutations: {
      /**
       * RETRY: Retries para mutations (create, update, delete)
       * 
       * Mutations têm risco (alteram dados), então retry baixo
       */
      retry: 1,

      /**
       * NETWORK MODE
       */
      networkMode: 'always',
    },
  },

  /**
   * Logger customizado para debug
   * Descomente para ver logs em desenvolvimento
   */
  // logger: DefaultLogger,
});
