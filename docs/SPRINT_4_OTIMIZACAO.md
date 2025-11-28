# Sprint 4 - Otimização de Performance

**Início:** 29/11/2024  
**Duração:** 1 semana  
**Meta:** 13 pontos  
**Foco:** Performance, caching e otimização de carregamento

---

## 🎯 Objetivos da Sprint 4

### Tema Principal: **Performance e Experiência do Usuário**

Após 3 sprints de desenvolvimento intenso, esta sprint foca em:

1. **Reduzir tempos de carregamento** - Páginas carregando < 2s
2. **Otimizar queries** - Database performance
3. **Implementar caching** - Reduzir requisições desnecessárias
4. **Code splitting** - Carregar apenas o necessário
5. **Otimizar assets** - Imagens e recursos estáticos

### Metas de Performance

| Métrica                        | Atual  | Meta    | Melhoria |
| ------------------------------ | ------ | ------- | -------- |
| First Contentful Paint (FCP)   | ~3s    | < 1.5s  | 50%      |
| Largest Contentful Paint (LCP) | ~4s    | < 2.5s  | 38%      |
| Time to Interactive (TTI)      | ~5s    | < 3s    | 40%      |
| Total Blocking Time (TBT)      | ~800ms | < 300ms | 63%      |
| Cumulative Layout Shift (CLS)  | 0.15   | < 0.1   | 33%      |
| Lighthouse Score               | 70     | > 90    | +20 pts  |

---

## 📋 User Stories (Performance)

### US-034: Otimização de Carregamento Inicial (3 pts)

**Como** usuário  
**Quero** que o site carregue rapidamente  
**Para** começar a trabalhar sem espera

#### Critérios de Aceitação

- [ ] Dashboard principal carrega em < 2s
- [ ] Skeleton loaders em todas as páginas
- [ ] Lazy loading de componentes pesados
- [ ] Code splitting automático
- [ ] Preload de recursos críticos

#### Tarefas Técnicas

**1. Implementar Code Splitting**

```typescript
// Lazy load componentes pesados
const ConversionReport = dynamic(() => import('@/components/reports/conversion-report'), {
  loading: () => <ReportSkeleton />,
  ssr: false
});

const AutomationForm = dynamic(() => import('@/components/automations/automation-form'), {
  loading: () => <FormSkeleton />
});
```

**2. Otimizar Bundle Size**

- [ ] Analisar bundle com `next/bundle-analyzer`
- [ ] Remover dependências não utilizadas
- [ ] Tree-shaking de bibliotecas grandes
- [ ] Substituir bibliotecas pesadas por alternativas

**3. Preloading e Prefetching**

```typescript
// next.config.js
experimental: {
  optimizeCss: true,
  optimizePackageImports: ['lucide-react', 'recharts']
}
```

**4. Skeleton Loaders**

- [ ] Criar skeleton para todos os componentes de listagem
- [ ] Skeleton para gráficos (Recharts)
- [ ] Skeleton para formulários
- [ ] Skeleton para cards de métricas

#### Arquivos a Modificar

- `next.config.js` - Configurações de build
- Todos os componentes pesados - Lazy loading
- Páginas de listagem - Skeleton loaders
- `package.json` - Análise de dependências

#### Medição de Sucesso

- Lighthouse Performance > 90
- FCP < 1.5s
- LCP < 2.5s
- Bundle size reduzido em 30%

---

### US-035: Caching e Invalidação (2 pts)

**Como** sistema  
**Quero** cachear dados frequentemente acessados  
**Para** reduzir requisições ao banco

#### Critérios de Aceitação

- [ ] Cache de queries pesadas (relatórios)
- [ ] Cache de dados estáticos (configs)
- [ ] Invalidação automática de cache
- [ ] Cache de API routes (Next.js)
- [ ] Service Worker para cache offline

#### Tarefas Técnicas

**1. Next.js Route Caching**

```typescript
// app/api/reports/conversion/route.ts
export const revalidate = 300; // 5 minutos

// app/dashboard/page.tsx
export const revalidate = 60; // 1 minuto
```

**2. React Query Setup**

```bash
npm install @tanstack/react-query
```

```typescript
// lib/query-client.ts
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 min
      cacheTime: 10 * 60 * 1000, // 10 min
      refetchOnWindowFocus: false,
    },
  },
});
```

**3. Supabase Client Caching**

```typescript
// Implementar cache local para queries repetidas
const cachedContacts = useMemo(() => contacts, [contacts]);
```

**4. Service Worker (Opcional)**

```typescript
// public/sw.js
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});
```

#### Arquivos a Criar/Modificar

- `src/lib/query-client.ts` - React Query setup
- `src/providers/query-provider.tsx` - Provider
- `src/app/layout.tsx` - Wrap com QueryProvider
- API routes - Adicionar revalidate
- Componentes - Migrar para useQuery

#### Medição de Sucesso

- 50% menos requests ao database
- Cache hit rate > 70%
- Tempo de resposta API < 100ms (cached)

---

### US-036: Otimização de Database Queries (3 pts)

**Como** sistema  
**Quero** queries SQL otimizadas  
**Para** responder mais rápido

#### Critérios de Aceitação

- [ ] Índices em colunas frequentemente filtradas
- [ ] Queries complexas otimizadas
- [ ] Paginação em todas as listagens
- [ ] Eliminação de N+1 queries
- [ ] Query analysis e EXPLAIN

#### Tarefas Técnicas

**1. Criar Índices no Database**

```sql
-- Migration: add_performance_indexes.sql

-- Índices para contacts
CREATE INDEX idx_contacts_user_id ON contacts(user_id);
CREATE INDEX idx_contacts_email ON contacts(email);
CREATE INDEX idx_contacts_created_at ON contacts(created_at DESC);

-- Índices para deals
CREATE INDEX idx_deals_user_id ON deals(user_id);
CREATE INDEX idx_deals_stage ON deals(stage);
CREATE INDEX idx_deals_contact_id ON deals(contact_id);
CREATE INDEX idx_deals_created_at ON deals(created_at DESC);

-- Índices para tasks
CREATE INDEX idx_tasks_user_id ON tasks(user_id);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_due_date ON tasks(due_date);
CREATE INDEX idx_tasks_deal_id ON tasks(deal_id);

-- Índices para activities
CREATE INDEX idx_activities_user_id ON activities(user_id);
CREATE INDEX idx_activities_entity_type_id ON activities(entity_type, entity_id);

-- Índices compostos
CREATE INDEX idx_tasks_user_status ON tasks(user_id, status);
CREATE INDEX idx_deals_user_stage ON deals(user_id, stage);
```

**2. Otimizar Queries Existentes**

```typescript
// ANTES - N+1 query
const contacts = await supabase.from('contacts').select('*');
for (const contact of contacts) {
  const deals = await supabase.from('deals').eq('contact_id', contact.id);
}

// DEPOIS - Single query
const contacts = await supabase
  .from('contacts')
  .select('*, deals(id, title, value, stage)')
  .limit(50);
```

**3. Implementar Paginação Cursor-based**

```typescript
// API route com cursor pagination
export async function GET(request: NextRequest) {
  const cursor = searchParams.get('cursor');
  const limit = 50;

  let query = supabase
    .from('contacts')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (cursor) {
    query = query.lt('created_at', cursor);
  }

  const { data } = await query;
  const nextCursor = data[data.length - 1]?.created_at;

  return { data, nextCursor, hasMore: data.length === limit };
}
```

**4. Query Analysis**

```sql
-- Analisar queries lentas
EXPLAIN ANALYZE
SELECT * FROM deals
WHERE user_id = 'xxx'
  AND stage = 'negotiation'
ORDER BY created_at DESC
LIMIT 50;
```

#### Arquivos a Criar/Modificar

- `supabase/migrations/20241129_add_performance_indexes.sql`
- API routes - Otimizar queries existentes
- API routes - Implementar cursor pagination
- `docs/DATABASE_OPTIMIZATION.md` - Documentação

#### Medição de Sucesso

- Query time reduzido em 60%
- Listagens carregam em < 500ms
- Relatórios complexos < 2s
- Índices cobrem 90% das queries

---

### US-037: Otimização de Assets e Imagens (2 pts)

**Como** usuário  
**Quero** que imagens carreguem rapidamente  
**Para** ter melhor experiência visual

#### Critérios de Aceitação

- [ ] Imagens otimizadas (WebP)
- [ ] Lazy loading de imagens
- [ ] Responsive images
- [ ] CDN para assets estáticos
- [ ] Compressão de assets

#### Tarefas Técnicas

**1. Next.js Image Optimization**

```typescript
// Usar componente Image do Next.js
import Image from 'next/image';

<Image
  src="/logo.png"
  alt="Logo"
  width={200}
  height={50}
  priority // Above fold
  placeholder="blur"
/>

<Image
  src={contact.avatar}
  alt={contact.name}
  width={40}
  height={40}
  loading="lazy" // Below fold
/>
```

**2. Compressão de Assets**

```bash
# Otimizar imagens existentes
npm install -D sharp
npx sharp-cli -i public/images -o public/images/optimized -f webp
```

**3. Font Optimization**

```typescript
// next.config.js
module.exports = {
  optimizeFonts: true,
  experimental: {
    fontLoaders: [{ loader: '@next/font/google', options: { subsets: ['latin'] } }],
  },
};
```

**4. Configurar CDN (Opcional)**

```typescript
// next.config.js
module.exports = {
  images: {
    domains: ['cdn.example.com'],
    loader: 'custom',
    path: 'https://cdn.example.com/',
  },
};
```

#### Arquivos a Criar/Modificar

- Todos os usos de `<img>` → `<Image>`
- `public/images/` - Otimizar e converter para WebP
- `next.config.js` - Configurar Image Optimization
- Fonts - Migrar para @next/font

#### Medição de Sucesso

- Tamanho de imagens reduzido em 70%
- LCP melhorado em 40%
- Todas imagens WebP ou AVIF
- Font loading otimizado

---

### US-038: Monitoramento de Performance (3 pts)

**Como** desenvolvedor  
**Quero** monitorar performance em produção  
**Para** identificar e corrigir problemas

#### Critérios de Aceitação

- [ ] Web Vitals tracking
- [ ] Error tracking (Sentry)
- [ ] Performance metrics dashboard
- [ ] Alertas de degradação
- [ ] Logs estruturados de performance

#### Tarefas Técnicas

**1. Setup Web Vitals**

```typescript
// app/layout.tsx
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
```

**2. Custom Performance Tracking**

```typescript
// lib/performance.ts
export function trackPerformance(name: string, startTime: number) {
  const duration = performance.now() - startTime;

  // Enviar para analytics
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'timing_complete', {
      name,
      value: Math.round(duration),
      event_category: 'Performance',
    });
  }

  // Log se muito lento
  if (duration > 1000) {
    logger.warn('Slow operation detected', { name, duration });
  }
}
```

**3. Setup Sentry (Error Tracking)**

```bash
npm install @sentry/nextjs
npx @sentry/wizard -i nextjs
```

```typescript
// sentry.client.config.ts
Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 0.1,
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
});
```

**4. Performance Dashboard**

```typescript
// app/admin/performance/page.tsx
export default function PerformanceDashboard() {
  return (
    <div>
      <h1>Performance Metrics</h1>

      {/* Core Web Vitals */}
      <MetricsCard metric="FCP" value={fcp} threshold={1500} />
      <MetricsCard metric="LCP" value={lcp} threshold={2500} />
      <MetricsCard metric="CLS" value={cls} threshold={0.1} />

      {/* API Performance */}
      <APIMetrics endpoint="/api/contacts" avgTime={200} />
      <APIMetrics endpoint="/api/reports/conversion" avgTime={1500} />

      {/* Database */}
      <DatabaseMetrics queryTime={50} cacheHitRate={0.75} />
    </div>
  );
}
```

#### Arquivos a Criar/Modificar

- `src/lib/performance.ts` - Performance utilities
- `src/app/layout.tsx` - Add Analytics components
- `sentry.*.config.ts` - Sentry configuration
- `src/app/admin/performance/page.tsx` - Dashboard
- `src/components/admin/metrics-card.tsx`

#### Medição de Sucesso

- Web Vitals tracking 100% dos usuários
- Alertas automáticos quando > threshold
- Dashboard acessível para equipe
- Error rate < 1%

---

## 🛠️ Tarefas de Infraestrutura

### Análise e Benchmarking

**1. Lighthouse CI**

```yaml
# .github/workflows/lighthouse.yml
name: Lighthouse CI
on: [push]
jobs:
  lighthouse:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm install && npm run build
      - uses: treosh/lighthouse-ci-action@v9
        with:
          urls: |
            http://localhost:3000
            http://localhost:3000/dashboard
          uploadArtifacts: true
```

**2. Bundle Analyzer**

```bash
npm install -D @next/bundle-analyzer
```

```javascript
// next.config.js
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

module.exports = withBundleAnalyzer({
  // config
});
```

```bash
ANALYZE=true npm run build
```

**3. Performance Testing**

```bash
npm install -D autocannon
```

```javascript
// scripts/load-test.js
const autocannon = require('autocannon');

autocannon(
  {
    url: 'http://localhost:3000/api/contacts',
    connections: 100,
    duration: 30,
  },
  console.log
);
```

---

## 📊 Métricas de Sucesso

### Performance Targets

| Página                          | Métrica       | Antes | Meta  | Melhor Caso |
| ------------------------------- | ------------- | ----- | ----- | ----------- |
| `/dashboard`                    | LCP           | 4s    | 2.5s  | < 2s        |
| `/dashboard/contacts`           | FCP           | 3s    | 1.5s  | < 1s        |
| `/dashboard/reports/conversion` | TTI           | 6s    | 3s    | < 2.5s      |
| API `/contacts`                 | Response Time | 500ms | 200ms | < 100ms     |
| API `/reports/conversion`       | Response Time | 3s    | 1.5s  | < 1s        |

### Bundle Size Targets

| Bundle        | Atual  | Meta   | Redução |
| ------------- | ------ | ------ | ------- |
| First Load JS | 250 KB | 150 KB | 40%     |
| Shared chunks | 100 KB | 60 KB  | 40%     |
| Page-specific | 50 KB  | 30 KB  | 40%     |

### Lighthouse Scores

| Categoria      | Atual | Meta |
| -------------- | ----- | ---- |
| Performance    | 70    | > 90 |
| Accessibility  | 85    | > 95 |
| Best Practices | 80    | > 95 |
| SEO            | 90    | > 95 |

---

## 📅 Cronograma

### Dia 1-2: Análise e Setup

- [ ] Rodar Lighthouse audit completo
- [ ] Analisar bundle size
- [ ] Identificar bottlenecks
- [ ] Setup ferramentas de monitoramento

### Dia 3-4: Implementação Core

- [ ] US-034: Code splitting e lazy loading
- [ ] US-035: Caching com React Query
- [ ] US-036: Database indexes

### Dia 5-6: Assets e Monitoramento

- [ ] US-037: Otimização de imagens
- [ ] US-038: Web Vitals tracking
- [ ] Sentry setup

### Dia 7: Testes e Validação

- [ ] Load testing
- [ ] Performance regression tests
- [ ] Documentação
- [ ] Deploy e validação

---

## 🎓 Recursos e Referências

### Documentação Oficial

- [Next.js Performance](https://nextjs.org/docs/advanced-features/measuring-performance)
- [Web Vitals](https://web.dev/vitals/)
- [React Query](https://tanstack.com/query/latest)
- [Supabase Performance](https://supabase.com/docs/guides/platform/performance)

### Ferramentas

- [Lighthouse](https://developers.google.com/web/tools/lighthouse)
- [WebPageTest](https://www.webpagetest.org/)
- [Bundle Analyzer](https://github.com/vercel/next.js/tree/canary/packages/next-bundle-analyzer)
- [React DevTools Profiler](https://react.dev/reference/react/Profiler)

### Benchmarks de Referência

- **Bom:** LCP < 2.5s, FCP < 1.8s, CLS < 0.1
- **Aceitável:** LCP < 4s, FCP < 3s, CLS < 0.25
- **Ruim:** Acima dos valores aceitáveis

---

## ✅ Checklist de Conclusão

### Performance

- [ ] Lighthouse Performance > 90
- [ ] FCP < 1.5s em todas as páginas
- [ ] LCP < 2.5s em todas as páginas
- [ ] CLS < 0.1
- [ ] TTI < 3s
- [ ] Bundle size reduzido 40%

### Caching

- [ ] React Query implementado
- [ ] Cache hit rate > 70%
- [ ] API routes com revalidation
- [ ] Supabase queries otimizadas

### Database

- [ ] Índices criados em todas as tabelas
- [ ] Queries otimizadas (EXPLAIN ANALYZE)
- [ ] Paginação implementada
- [ ] Query time < 500ms

### Assets

- [ ] Todas imagens WebP
- [ ] Next.js Image em todos os lugares
- [ ] Fonts otimizadas
- [ ] Compressão habilitada

### Monitoramento

- [ ] Web Vitals tracking ativo
- [ ] Sentry configurado
- [ ] Performance dashboard criado
- [ ] Alertas configurados

---

**Documento criado em:** 28/11/2024  
**Versão:** 1.0  
**Status:** Planejamento
