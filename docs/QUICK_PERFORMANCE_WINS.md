# 🚀 PLANO DE AÇÃO: Melhorias Rápidas (30 Minutos)

**Objetivo:** Remover menu items e aplicar otimizações básicas de performance  
**Estimado:** 30 minutos  
**Impacto:** Bundle -230 KB, Performance score +20 pts

---

## ✅ Passo 1: Remover Items do Menu (5 min)

### Arquivos a Modificar
- `src/components/layout/sidebar.tsx`

### O Que Fazer
Manter apenas:
- ✅ Dashboard
- ✅ Contatos  
- ✅ Conversas
- ✅ Negócios (Pipeline)

Remover:
- ❌ Tarefas
- ❌ Atividades
- ❌ Automações
- ❌ Analytics
- ❌ Relatórios
- ❌ Configurações

---

## ✅ Passo 2: Configurar next.config.js (5 min)

### Adicionar Otimizações

```javascript
// next.config.js
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

module.exports = withBundleAnalyzer({
  images: {
    formats: ['image/avif', 'image/webp'],
  },
  experimental: {
    optimizeCss: true,
    optimizePackageImports: ['lucide-react', 'recharts'],
  },
  compress: true,
  productionBrowserSourceMaps: false,
});
```

**Comandos:**
```bash
# Para analisar bundle
ANALYZE=true npm run build
```

---

## ✅ Passo 3: Criar Skeleton Components (10 min)

### Arquivo 1: `src/components/skeletons/contacts-skeleton.tsx`

```typescript
import { Card } from '@/components/ui/card';

export function ContactsSkeleton() {
  return (
    <div className="space-y-2">
      {Array(6)
        .fill(0)
        .map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-4 p-3 rounded-lg bg-muted animate-pulse"
          >
            <div className="h-10 w-10 rounded-full bg-muted-foreground/20" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-32 bg-muted-foreground/20 rounded" />
              <div className="h-3 w-24 bg-muted-foreground/20 rounded" />
            </div>
          </div>
        ))}
    </div>
  );
}
```

### Arquivo 2: `src/components/skeletons/conversations-skeleton.tsx`

```typescript
export function ConversationsSkeleton() {
  return (
    <div className="space-y-2">
      {Array(8)
        .fill(0)
        .map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-2 p-2 rounded-lg bg-muted animate-pulse"
          >
            <div className="h-10 w-10 rounded-full bg-muted-foreground/20" />
            <div className="flex-1 space-y-1">
              <div className="h-3 w-24 bg-muted-foreground/20 rounded" />
              <div className="h-2 w-32 bg-muted-foreground/20 rounded" />
            </div>
          </div>
        ))}
    </div>
  );
}
```

### Arquivo 3: `src/components/skeletons/dashboard-skeleton.tsx`

```typescript
export function DashboardSkeleton() {
  return (
    <div className="space-y-4">
      {/* Metrics Row */}
      <div className="grid grid-cols-4 gap-4">
        {Array(4)
          .fill(0)
          .map((_, i) => (
            <div
              key={i}
              className="h-24 bg-muted rounded-lg animate-pulse"
            />
          ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-2 gap-4">
        <div className="h-64 bg-muted rounded-lg animate-pulse" />
        <div className="h-64 bg-muted rounded-lg animate-pulse" />
      </div>

      {/* Table */}
      <div className="h-96 bg-muted rounded-lg animate-pulse" />
    </div>
  );
}
```

---

## ✅ Passo 4: Lazy Load Dashboard (10 min)

### Modificar: `src/app/(dashboard)/dashboard/page.tsx`

```typescript
'use client';

import dynamic from 'next/dynamic';
import { Suspense } from 'react';
import { DashboardSkeleton } from '@/components/skeletons/dashboard-skeleton';

// Lazy load componentes pesados
const ConversionReport = dynamic(
  () => import('@/components/reports/conversion-report'),
  {
    loading: () => <div className="h-64 bg-muted rounded-lg animate-pulse" />,
  }
);

const PerformanceMetrics = dynamic(
  () => import('@/components/analytics/performance-metrics'),
  {
    loading: () => <DashboardSkeleton />,
  }
);

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Dashboard</h1>

      <Suspense fallback={<DashboardSkeleton />}>
        <PerformanceMetrics />
      </Suspense>

      <Suspense fallback={<div className="h-64 bg-muted animate-pulse" />}>
        <ConversionReport />
      </Suspense>
    </div>
  );
}
```

---

## ✅ Passo 5: Lazy Load Pipeline (5 min)

### Modificar: `src/app/(dashboard)/dashboard/deals/pipeline/page.tsx`

```typescript
'use client';

import dynamic from 'next/dynamic';
import { Suspense } from 'react';

const PipelineBoard = dynamic(
  () => import('@/components/deals/pipeline-board'),
  {
    loading: () => (
      <div className="h-96 bg-muted rounded-lg animate-pulse" />
    ),
  }
);

export default function PipelinePage() {
  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-bold">Pipeline de Negócios</h1>

      <Suspense fallback={<div className="h-96 bg-muted animate-pulse" />}>
        <PipelineBoard />
      </Suspense>
    </div>
  );
}
```

---

## ✅ Passo 6: Otimizar Imports (5 min)

### Verificar e Corrigir

```typescript
// ❌ ANTES (importa tudo)
import * as Icons from 'lucide-react';

// ✅ DEPOIS (apenas necessário)
import { Users, MessageSquare, BarChart3, Settings } from 'lucide-react';

// ❌ ANTES (importa todas as funções)
import recharts from 'recharts';

// ✅ DEPOIS (apenas necessário)
import { BarChart, LineChart } from 'recharts';
```

**Arquivos a Verificar:**
- `src/components/layout/sidebar.tsx`
- `src/app/(dashboard)/dashboard/page.tsx`
- Todos os componentes de gráficos

---

## ✅ Build e Teste (5 min)

```bash
# 1. Build
npm run build

# 2. Verificar bundle
ANALYZE=true npm run build

# 3. Testar dev
npm run dev

# 4. Verificar performance
# DevTools → Lighthouse → Run audit
```

### Métricas Esperadas
```
Bundle Size:  400 KB → 250 KB (-37%)
FCP:          ~3s → ~2s (-33%)
LCP:          ~4s → ~2.5s (-37%)
Lighthouse:   70 → 85 (+15 pts)
```

---

## 📋 Checklist Final

- [ ] Menu items removidos do sidebar
- [ ] next.config.js otimizado
- [ ] 3 skeleton components criados
- [ ] Dashboard lazy loaded
- [ ] Pipeline lazy loaded
- [ ] Imports otimizados
- [ ] Build testado
- [ ] Lighthouse audit rodado
- [ ] Mudanças committed

---

## 📊 Commits Sugeridos

```bash
# 1. Menu cleanup
git commit -m "cleanup: remove unimplemented menu items from sidebar"

# 2. Performance improvements
git commit -m "perf: add code splitting and lazy loading for heavy components"

# 3. Skeleton loaders
git commit -m "feat: add skeleton loaders for better UX during loading"

# 4. Build optimization
git commit -m "perf: optimize next.config.js for bundle size reduction"
```

---

## 🎯 Próximas Prioridades

Após isso, em ordem:

1. **Database Indices** (1h)
   - Criar índices nas tabelas principais
   
2. **React Query Setup** (2h)
   - Caching inteligente de queries
   
3. **Image Optimization** (1h)
   - Converter para WebP, adicionar lazy loading
   
4. **Web Vitals Tracking** (1h)
   - Setup Vercel Analytics + SpeedInsights

---

**Tempo Total:** ~30 minutos para MVP muito mais rápido! 🚀
