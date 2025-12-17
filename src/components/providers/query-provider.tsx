'use client';

import { ReactNode } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/lib/react-query';

/**
 * React Query Provider Wrapper
 * 
 * IMPORTANTE: Este é um Client Component que envolve o QueryClientProvider.
 * Isso evita que a instância de classe QueryClient seja serializada
 * quando passada de Server Components para Client Components.
 * 
 * Isso resolve o erro:
 * "Only plain objects, and a few built-ins, can be passed to Client Components
 *  from Server Components. Classes or null prototypes are not supported."
 */
export function QueryProvider({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
