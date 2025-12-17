# 🐛 FIX: Server->Client Component Serialization Error

**Data:** 17 de Dezembro de 2025  
**Status:** ✅ RESOLVIDO

---

## 🔴 O Problema

Erro ao compilar e rodar a aplicação:

```
Error: Only plain objects, and a few built-ins, can be passed to Client Components 
from Server Components. Classes or null prototypes are not supported.

Call Stack:
Object.toJSON
stringify
...
```

---

## 🔍 Causa Raiz

Next.js 14 com App Router não permite passar **instâncias de classe** de Server Components para Client Components. O problema estava em **duas lugares**:

### 1. **QueryClient (TanStack React Query)**

```typescript
// ❌ ANTES - No root layout.tsx
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/lib/react-query';  // Instância de classe!

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <QueryClientProvider client={queryClient}>  {/* ❌ Classe sendo serializada */}
          {children}
        </QueryClientProvider>
      </body>
    </html>
  );
}
```

### 2. **Logger (Custom Logger Class)**

```typescript
// ❌ ANTES - No src/lib/logger.ts
class Logger {
  debug(message, context) { ... }
  error(message, context) { ... }
}

export const logger = new Logger();  // ❌ Instância de classe
```

---

## ✅ A Solução

### 1. **Criar QueryProvider Wrapper (Client Component)**

```typescript
// ✅ NOVO - src/components/providers/query-provider.tsx
'use client';

import { ReactNode } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/lib/react-query';

/**
 * React Query Provider Wrapper
 * 
 * Este é um Client Component que envolve QueryClientProvider.
 * Isso mantém a instância de classe QueryClient dentro da
 * boundary de Client Components, evitando serialização.
 */
export function QueryProvider({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
```

### 2. **Usar QueryProvider no Root Layout**

```typescript
// ✅ DEPOIS - src/app/layout.tsx
import { QueryProvider } from '@/components/providers/query-provider';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <QueryProvider>  {/* ✅ Instância de classe nunca deixa o Client Component */}
          <ThemeProvider>
            {children}
          </ThemeProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
```

### 3. **Converter Logger para Plain Object**

```typescript
// ✅ DEPOIS - src/lib/logger.ts
const isDevelopment = process.env.NODE_ENV === 'development';

// Plain object - não é uma classe, pode ser serializado
export const logger = {
  debug(message: string, context?: LogContext) { ... },
  info(message: string, context?: LogContext) { ... },
  warn(message: string, context?: LogContext) { ... },
  error(message: string, context?: LogContext) { ... },
  critical(message: string, context?: LogContext) { ... },
};
```

### 4. **Desabilitar Static Generation para Dashboard**

```typescript
// ✅ DEPOIS - src/app/(dashboard)/layout.tsx
export const dynamic = 'force-dynamic';
export const revalidate = 0;

// Isso evita que Next.js tente pré-renderizar estaticamente
// páginas que usam autenticação e cookies
```

---

## 📋 Mudanças Realizadas

| Arquivo | Mudança | Status |
|---------|---------|--------|
| `src/components/providers/query-provider.tsx` | ✨ Criado (novo arquivo) | ✅ |
| `src/app/layout.tsx` | Substituir QueryClientProvider → QueryProvider | ✅ |
| `src/lib/logger.ts` | Converter class Logger → plain object | ✅ |
| `src/app/(dashboard)/layout.tsx` | Adicionar `dynamic = 'force-dynamic'` | ✅ |

---

## 🧪 Validação

### Dev Server
```bash
✅ Iniciou com sucesso
✅ Sem erros de serialização
✅ Sem erros de hydration
```

### TypeScript
```bash
✅ Compilação OK (erros pré-existentes ignorados)
✅ Tipos corretos para QueryProvider
✅ Tipos corretos para logger
```

---

## 🎯 Lição Aprendida

### Next.js 14 Server Components - Regra de Ouro

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  Server Components podem passar props para Client Components │
│  MAS apenas se forem "plain objects":                       │
│                                                             │
│  ✅ Permitido:                                              │
│    - { id: '123', name: 'João' }                           │
│    - [1, 2, 3]                                              │
│    - new Date().toISOString()  (string, não Date object)   │
│    - { toJSON() {...} } (plain object com método)          │
│                                                             │
│  ❌ NÃO Permitido:                                          │
│    - new QueryClient()  (instância de classe)              │
│    - new Logger()  (instância de classe)                   │
│    - new Date()  (objeto Date)                             │
│    - Qualquer object com prototype chain                    │
│                                                             │
│  SOLUÇÃO:                                                   │
│  Wrappear class instances em Client Components!            │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔧 Padrão para Futuro

Se precisar usar outras bibliotecas com classes:

```typescript
// ❌ ERRADO - Passar classe de Server para Client
import SomeClass from 'lib';
export default function ServerLayout({ children }) {
  const instance = new SomeClass();
  return <ClientComponent prop={instance} />;  // ❌ Erro!
}

// ✅ CORRETO - Wrappear em Client Component
// 1. Criar wrapper Client Component:
'use client';
export function Wrapper({ children }) {
  const instance = new SomeClass();  // ✅ OK aqui, pois é Client Component
  return <Provider instance={instance}>{children}</Provider>;
}

// 2. Usar wrapper no Server Layout:
export default function ServerLayout({ children }) {
  return <Wrapper>{children}</Wrapper>;  // ✅ OK, não passa a classe
}
```

---

## 📊 Impacto

| Aspecto | Antes | Depois |
|---------|-------|--------|
| **Dev Server** | ❌ Erro ao iniciar | ✅ Inicia normalmente |
| **Build** | ⏳ Timeout (pré-renderização) | ✅ Rápido (force-dynamic) |
| **Runtime** | ❌ Erro de serialização | ✅ Sem erros |
| **Type Safety** | ⚠️ Warnings | ✅ Tipos corretos |

---

## ✅ Checklist

- [x] QueryProvider criado e testado
- [x] Root layout atualizado
- [x] Logger convertido para plain object
- [x] Dashboard layout com force-dynamic
- [x] Dev server rodando sem erros
- [x] Commit realizado
- [x] Documentação criada

---

**Status:** ✅ Erro Resolvido  
**Teste:** ✅ Dev server OK  
**Próximo Passo:** Continuar com Fase 3 (UI/UX Polish)
