# US-031: Dashboard Analytics Avançado

**Story Points:** 5 pontos  
**Status:** Não Iniciada  
**Sprint:** 3.1 (Pendente da Sprint 3)  
**Prioridade:** Média  
**Dependências:** US-029 (Relatório de Conversão) ✅

---

## 📋 User Story

**Como** gestor  
**Quero** ver métricas avançadas de performance e analytics  
**Para** tomar decisões estratégicas baseadas em dados

---

## ✅ Critérios de Aceitação

### Funcionalidades Obrigatórias

1. **Gráfico de Receita** ✓
   - Receita realizada vs prevista (mensal)
   - Linha de tendência
   - Comparação período anterior
   - Filtro de período (7d, 30d, 90d, custom)

2. **Distribuição do Pipeline** ✓
   - Gráfico de pizza/donut por valor
   - Gráfico de pizza/donut por quantidade
   - Valor total em cada estágio
   - Drill-down para detalhes

3. **Métricas de Performance** ✓
   - Taxa de fechamento (win rate)
   - Ticket médio
   - Ciclo de vendas médio
   - Conversão lead → cliente
   - Sparklines de tendência

4. **Forecast de Receita** ✓
   - Projeção 3 meses futuros
   - Base: deals em negociação + probabilidade
   - Cenários: pessimista, realista, otimista
   - Gráfico de área com intervalo confiança

5. **Análise de Tendências** ✓
   - Crescimento mês a mês
   - Comparação ano anterior
   - Gráfico de barras agrupadas
   - Taxa de crescimento %

6. **Origem de Leads** ✓
   - Gráfico donut por fonte
   - Top 5 fontes
   - Conversão por fonte
   - ROI por canal (se disponível)

7. **Progresso de Metas** ✓
   - Metas mensais/trimestrais
   - Barras de progresso
   - % atingido vs meta
   - Projeção de atingimento

### Funcionalidades Opcionais

8. **Performance por Vendedor** (se multi-user)
   - Ranking de vendedores
   - Comparação entre vendedores
   - Média da equipe

9. **Análise de Produtos** (se implementado)
   - Produtos mais vendidos
   - Receita por produto
   - Margem por produto

10. **Heat Map de Atividades**
    - Dias/horários com mais atividade
    - Padrões de fechamento

---

## 🎨 Especificação de Interface

### Página Principal: `/dashboard/analytics`

**Layout:**
```
+------------------+------------------+------------------+
|   Card KPI 1     |   Card KPI 2     |   Card KPI 3     |
|  (Taxa Fecham.)  |  (Ticket Médio)  | (Ciclo Vendas)   |
+------------------+------------------+------------------+
|                                                         |
|              Gráfico de Receita (Grande)                |
|           (Receita Realizada vs Prevista)               |
|                                                         |
+---------------------------------------------------------+
|                     |                                   |
|  Pipeline Distrib.  |      Forecast 3 Meses            |
|   (Donut Chart)     |      (Area Chart)                |
|                     |                                   |
+---------------------+-----------------------------------+
```

**Tabs/Seções:**
1. **Overview** - Cards + gráficos principais
2. **Receita** - Análise detalhada de receita
3. **Pipeline** - Distribuição e health do pipeline
4. **Performance** - KPIs e métricas de eficiência
5. **Forecast** - Projeções futuras
6. **Tendências** - Histórico e crescimento
7. **Origem** - Análise de fontes de leads

### Filtros Globais

**Período:**
- Últimos 7 dias
- Últimos 30 dias
- Últimos 90 dias
- Este mês
- Mês anterior
- Este trimestre
- Custom (date range picker)

**Comparação:**
- [ ] Comparar com período anterior
- [ ] Mostrar tendência
- [ ] Mostrar forecast

---

## 🔧 Especificação Técnica

### 1. Backend APIs

#### GET /api/analytics/revenue
Calcula receita realizada e prevista

**Query Parameters:**
- `startDate` (ISO date)
- `endDate` (ISO date)
- `groupBy` (day, week, month)

**Response:**
```typescript
{
  realized: {
    total: number,
    data: Array<{ date: string, value: number }>
  },
  expected: {
    total: number,
    data: Array<{ date: string, value: number }>
  },
  comparison: {
    previousPeriod: number,
    percentChange: number
  }
}
```

**SQL Query:**
```sql
-- Receita realizada (deals com stage = won)
SELECT 
  DATE_TRUNC('month', updated_at) as date,
  SUM(value) as value
FROM deals
WHERE stage = 'won'
  AND user_id = $1
  AND updated_at BETWEEN $2 AND $3
GROUP BY date
ORDER BY date;

-- Receita prevista (deals em negociação * probabilidade)
SELECT 
  DATE_TRUNC('month', expected_close_date) as date,
  SUM(value * probability / 100) as value
FROM deals
WHERE stage IN ('qualified', 'proposal', 'negotiation')
  AND user_id = $1
  AND expected_close_date BETWEEN $2 AND $3
GROUP BY date
ORDER BY date;
```

#### GET /api/analytics/pipeline
Distribuição do pipeline por estágio

**Response:**
```typescript
{
  byValue: Array<{
    stage: string,
    value: number,
    count: number,
    percentage: number
  }>,
  byCount: Array<{
    stage: string,
    count: number,
    percentage: number
  }>,
  total: {
    value: number,
    count: number
  }
}
```

#### GET /api/analytics/performance
Métricas de performance

**Response:**
```typescript
{
  winRate: {
    current: number,
    previous: number,
    change: number
  },
  averageTicket: {
    current: number,
    previous: number,
    change: number
  },
  salesCycle: {
    current: number, // dias
    previous: number,
    change: number
  },
  conversionRate: {
    leadToCustomer: number,
    stageByStage: Array<{
      from: string,
      to: string,
      rate: number
    }>
  },
  trends: {
    daily: Array<{ date: string, value: number }>,
    weekly: Array<{ date: string, value: number }>,
    monthly: Array<{ date: string, value: number }>
  }
}
```

#### GET /api/analytics/forecast
Projeção de receita futura

**Query Parameters:**
- `months` (default: 3)

**Response:**
```typescript
{
  forecast: Array<{
    month: string,
    pessimistic: number,  // probabilidade * 0.5
    realistic: number,    // probabilidade * 1.0
    optimistic: number    // probabilidade * 1.5
  }>,
  confidence: number, // 0-100
  basis: {
    dealsInPipeline: number,
    totalValue: number,
    averageCloseRate: number
  }
}
```

**Cálculo:**
```typescript
// Para cada deal em negotiation/proposal:
const expectedValue = deal.value * (deal.probability / 100);

// Agrupar por mês esperado de fechamento
// Aplicar multiplicadores:
pessimistic = expectedValue * 0.5
realistic = expectedValue * 1.0
optimistic = expectedValue * 1.5
```

#### GET /api/analytics/trends
Análise de tendências históricas

**Response:**
```typescript
{
  monthOverMonth: Array<{
    month: string,
    revenue: number,
    deals: number,
    growth: {
      revenue: number,  // %
      deals: number     // %
    }
  }>,
  yearOverYear: {
    currentYear: number,
    previousYear: number,
    growth: number
  },
  seasonality: {
    bestMonth: string,
    worstMonth: string,
    average: number
  }
}
```

### 2. Frontend Components

#### RevenueChart.tsx
```typescript
interface RevenueChartProps {
  data: {
    realized: Array<{ date: string; value: number }>;
    expected: Array<{ date: string; value: number }>;
  };
  comparison?: boolean;
}

// Usa Recharts ComposedChart
// Area chart para receita realizada (azul)
// Line chart para receita prevista (tracejado, verde)
// Tooltip com formatação BRL
```

#### PipelineDistribution.tsx
```typescript
interface PipelineDistributionProps {
  data: Array<{
    stage: string;
    value: number;
    count: number;
    percentage: number;
  }>;
  view: 'value' | 'count';
}

// Usa Recharts PieChart com customização
// Legend com valores e %
// Cores por estágio (mapeamento fixo)
```

#### PerformanceMetrics.tsx
```typescript
interface PerformanceMetricsProps {
  metrics: {
    winRate: MetricWithTrend;
    averageTicket: MetricWithTrend;
    salesCycle: MetricWithTrend;
  };
}

interface MetricWithTrend {
  current: number;
  previous: number;
  change: number;
  trend: 'up' | 'down' | 'stable';
  sparkline?: Array<{ date: string; value: number }>;
}

// Grid 3 colunas
// Card para cada métrica
// Ícone de tendência (↑↓→)
// Sparkline inline (Recharts LineChart mini)
```

#### ForecastChart.tsx
```typescript
interface ForecastChartProps {
  data: Array<{
    month: string;
    pessimistic: number;
    realistic: number;
    optimistic: number;
  }>;
}

// Recharts AreaChart
// 3 áreas empilhadas com transparência
// Legenda: Pessimista / Realista / Otimista
// Tooltip com range
```

#### TrendsChart.tsx
```typescript
interface TrendsChartProps {
  data: Array<{
    month: string;
    revenue: number;
    deals: number;
    growth: { revenue: number; deals: number };
  }>;
}

// Recharts ComposedChart
// Bar chart para receita (azul)
// Line chart para crescimento % (verde)
// Dual axis (R$ e %)
```

#### LeadsSourceChart.tsx
```typescript
interface LeadsSourceChartProps {
  data: Array<{
    source: string;
    count: number;
    percentage: number;
    conversionRate: number;
  }>;
}

// Recharts PieChart (donut)
// Top 5 fontes
// Others agrupado
// Click para drill-down (opcional)
```

#### GoalsProgress.tsx
```typescript
interface GoalsProgressProps {
  goals: Array<{
    name: string;
    target: number;
    current: number;
    percentage: number;
    deadline: string;
    onTrack: boolean;
  }>;
}

// Progress bars com cores
// Verde: > 80%
// Amarelo: 50-80%
// Vermelho: < 50%
// Badge "On Track" / "At Risk"
```

### 3. Estrutura de Arquivos

```
src/
├── app/
│   ├── api/
│   │   └── analytics/
│   │       ├── revenue/route.ts         (100 linhas)
│   │       ├── pipeline/route.ts        (80 linhas)
│   │       ├── performance/route.ts     (120 linhas)
│   │       ├── forecast/route.ts        (150 linhas)
│   │       └── trends/route.ts          (90 linhas)
│   └── (dashboard)/
│       └── dashboard/
│           └── analytics/
│               ├── page.tsx             (250 linhas) - Overview
│               ├── revenue/page.tsx     (150 linhas)
│               ├── pipeline/page.tsx    (130 linhas)
│               ├── performance/page.tsx (160 linhas)
│               └── forecast/page.tsx    (140 linhas)
│
├── components/
│   └── analytics/
│       ├── revenue-chart.tsx            (180 linhas)
│       ├── pipeline-distribution.tsx    (140 linhas)
│       ├── performance-metrics.tsx      (200 linhas)
│       ├── forecast-chart.tsx           (160 linhas)
│       ├── trends-chart.tsx             (140 linhas)
│       ├── leads-source-chart.tsx       (120 linhas)
│       ├── goals-progress.tsx           (100 linhas)
│       ├── analytics-filters.tsx        (80 linhas)
│       └── metric-card.tsx              (60 linhas)
│
└── types/
    └── analytics.ts                     (100 linhas)
```

**Total estimado:** ~2.350 linhas de código

---

## 💾 Mudanças no Database

### Nova Tabela: goals

```sql
CREATE TABLE goals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  target_value DECIMAL(10,2) NOT NULL,
  target_type VARCHAR(50) NOT NULL, -- revenue, deals, contacts
  period VARCHAR(50) NOT NULL, -- monthly, quarterly, yearly
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_goals_user_id ON goals(user_id);
CREATE INDEX idx_goals_period ON goals(period);
CREATE INDEX idx_goals_active ON goals(is_active);

-- RLS Policies
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own goals"
  ON goals FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own goals"
  ON goals FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own goals"
  ON goals FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own goals"
  ON goals FOR DELETE
  USING (auth.uid() = user_id);
```

### Alterações em deals

```sql
-- Adicionar campos para analytics
ALTER TABLE deals 
ADD COLUMN IF NOT EXISTS actual_close_date TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS closed_value DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS lost_reason TEXT;

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_deals_actual_close_date 
  ON deals(actual_close_date) 
  WHERE actual_close_date IS NOT NULL;

-- Trigger para preencher actual_close_date
CREATE OR REPLACE FUNCTION set_actual_close_date()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.stage = 'won' AND OLD.stage != 'won' THEN
    NEW.actual_close_date = now();
    NEW.closed_value = COALESCE(NEW.value, 0);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER deals_close_date_trigger
  BEFORE UPDATE ON deals
  FOR EACH ROW
  EXECUTE FUNCTION set_actual_close_date();
```

---

## 📊 Cálculos e Fórmulas

### Win Rate (Taxa de Fechamento)
```
Win Rate = (Deals Won / Total Deals Closed) * 100

onde:
- Deals Won = deals com stage = 'won'
- Total Deals Closed = deals com stage IN ('won', 'lost')
```

### Average Ticket (Ticket Médio)
```
Average Ticket = Total Revenue / Number of Deals Won

onde:
- Total Revenue = SUM(value) dos deals won
- Number of Deals Won = COUNT(deals) com stage = 'won'
```

### Sales Cycle (Ciclo de Vendas)
```
Sales Cycle = AVG(actual_close_date - created_at)

onde:
- Calcular apenas para deals com stage = 'won'
- Resultado em dias
```

### Conversion Rate (Taxa de Conversão)
```
Lead to Customer = (Deals Won / Total Leads) * 100

Stage to Stage = (Deals in Stage N+1 / Deals in Stage N) * 100
```

### Forecast (Previsão)
```
Realistic = SUM(deal.value * deal.probability / 100)

Pessimistic = Realistic * 0.5

Optimistic = Realistic * 1.5

onde:
- Considerar apenas deals em 'qualified', 'proposal', 'negotiation'
- Agrupar por expected_close_date (mês)
```

### Month over Month Growth
```
MoM Growth = ((Current Month - Previous Month) / Previous Month) * 100
```

---

## 🎯 Métricas de Sucesso

### Performance

- [ ] Página carrega em < 3s (com cache)
- [ ] Gráficos renderizam em < 1s
- [ ] Queries otimizadas com índices
- [ ] Cache de 5 minutos para dados agregados

### Usabilidade

- [ ] Todos os gráficos responsivos
- [ ] Filtros aplicam instantaneamente
- [ ] Tooltips informativos em todos os gráficos
- [ ] Export de dados (CSV/PNG)

### Dados

- [ ] Cálculos precisos (validados manualmente)
- [ ] Forecast com margem erro < 20%
- [ ] Dados atualizados em tempo real
- [ ] Histórico de 12 meses disponível

---

## 📅 Estimativa de Esforço

### Breakdown Detalhado

| Tarefa | Horas | Complexidade |
|--------|-------|--------------|
| **Backend APIs** | | |
| - Revenue analytics | 1.5h | Média |
| - Pipeline distribution | 1h | Baixa |
| - Performance metrics | 2h | Alta |
| - Forecast calculation | 2h | Alta |
| - Trends analysis | 1.5h | Média |
| **Frontend Components** | | |
| - RevenueChart | 2h | Média |
| - PipelineDistribution | 1.5h | Baixa |
| - PerformanceMetrics | 2h | Média |
| - ForecastChart | 1.5h | Média |
| - TrendsChart | 1.5h | Média |
| - LeadsSourceChart | 1h | Baixa |
| - GoalsProgress | 1h | Baixa |
| **Páginas e Layout** | | |
| - Analytics main page | 2h | Média |
| - Sub-páginas (4) | 2h | Baixa |
| - Filtros globais | 1h | Baixa |
| **Database** | | |
| - Migration goals table | 0.5h | Baixa |
| - Alter deals table | 0.5h | Baixa |
| - Triggers | 1h | Média |
| **Testes e Ajustes** | | |
| - Validação cálculos | 2h | Alta |
| - Ajustes visuais | 1h | Baixa |
| - Performance tuning | 1h | Média |
| **Total** | **28-32h** | - |

### Divisão Sugerida

**Opção 1: Single Sprint (5 pts)**
- Implementar tudo de uma vez
- Duração: 3-4 dias
- Risco: Alto (muita coisa)

**Opção 2: Duas Sprints (2 + 3 pts)**
- Sprint 3.1: Básico (2 pts, 12h)
  - Revenue chart
  - Pipeline distribution
  - Performance metrics
  - Analytics main page
- Sprint 3.2: Avançado (3 pts, 16h)
  - Forecast
  - Trends
  - Goals
  - Sub-páginas

**Recomendação:** Opção 2 (menor risco)

---

## 🔗 Dependências

### Pré-requisitos

- [x] Recharts instalado (usado em US-029)
- [x] Deals com expected_close_date
- [x] Contacts com source
- [ ] date-fns para manipulação de datas
- [ ] Dados históricos (mínimo 3 meses)

### Bibliotecas Adicionais

```bash
npm install date-fns
```

### Migrations Necessárias

1. `20241129_create_goals_table.sql`
2. `20241129_alter_deals_analytics.sql`

---

## 📚 Referências

### Design Inspiration

- [Mixpanel Analytics](https://mixpanel.com)
- [Amplitude Dashboard](https://amplitude.com)
- [Google Analytics 4](https://analytics.google.com)
- [HubSpot Analytics](https://www.hubspot.com/products/marketing/analytics)

### Recharts Examples

- [Revenue Chart with Comparison](https://recharts.org/en-US/examples/ComposedChart)
- [Donut Chart](https://recharts.org/en-US/examples/TwoLevelPieChart)
- [Forecast Area Chart](https://recharts.org/en-US/examples/StackedAreaChart)
- [Sparklines](https://recharts.org/en-US/examples/TinyLineChart)

### Cálculos de Forecast

- [Sales Forecasting Methods](https://www.salesforce.com/resources/articles/sales-forecasting/)
- [Pipeline Velocity](https://www.hubspot.com/sales/pipeline-velocity)

---

## ✅ Checklist de Implementação

### Preparação

- [ ] Ler toda a especificação
- [ ] Revisar US-029 (base de código)
- [ ] Instalar date-fns
- [ ] Criar branch: `feature/US-031-analytics`

### Backend (Dia 1)

- [ ] Criar migrations (goals + deals)
- [ ] Aplicar migrations no Supabase
- [ ] Implementar GET /api/analytics/revenue
- [ ] Implementar GET /api/analytics/pipeline
- [ ] Implementar GET /api/analytics/performance
- [ ] Implementar GET /api/analytics/forecast
- [ ] Implementar GET /api/analytics/trends
- [ ] Testar todas as APIs com Postman/Insomnia

### Frontend - Componentes (Dia 2)

- [ ] Criar types em src/types/analytics.ts
- [ ] Implementar MetricCard (base)
- [ ] Implementar RevenueChart
- [ ] Implementar PipelineDistribution
- [ ] Implementar PerformanceMetrics
- [ ] Implementar ForecastChart
- [ ] Implementar TrendsChart
- [ ] Implementar LeadsSourceChart
- [ ] Implementar GoalsProgress

### Frontend - Páginas (Dia 3)

- [ ] Criar AnalyticsFilters
- [ ] Implementar /dashboard/analytics (main)
- [ ] Implementar /dashboard/analytics/revenue
- [ ] Implementar /dashboard/analytics/pipeline
- [ ] Implementar /dashboard/analytics/performance
- [ ] Implementar /dashboard/analytics/forecast
- [ ] Adicionar link no sidebar
- [ ] Atualizar hub de relatórios

### Testes e Ajustes (Dia 4)

- [ ] Validar todos os cálculos manualmente
- [ ] Testar com dados reais
- [ ] Ajustar cores e estilos
- [ ] Otimizar queries lentas
- [ ] Adicionar skeleton loaders
- [ ] Tratamento de erros
- [ ] Responsividade mobile
- [ ] Accessibility (a11y)

### Finalização

- [ ] Code review
- [ ] Commit e push
- [ ] Criar PR
- [ ] Documentar em docs/US-031_CONCLUSAO.md
- [ ] Atualizar SPRINT_3_RELATORIO_FINAL.md
- [ ] Demo para stakeholders

---

## 🚀 Como Começar

### 1. Criar Branch
```bash
git checkout -b feature/US-031-analytics
```

### 2. Instalar Dependências
```bash
npm install date-fns
```

### 3. Criar Migrations
```bash
# Criar arquivo: supabase/migrations/20241129_create_goals_table.sql
# Copiar SQL da seção "Mudanças no Database"
```

### 4. Aplicar Migrations
```bash
# Via Supabase Dashboard SQL Editor ou CLI
```

### 5. Começar Backend
```bash
# Criar: src/app/api/analytics/revenue/route.ts
# Implementar lógica conforme spec
```

### 6. Desenvolver Componentes
```bash
# Criar: src/components/analytics/revenue-chart.tsx
# Usar Recharts conforme exemplos
```

### 7. Testar Continuamente
```bash
npm run dev
# Abrir http://localhost:3000/dashboard/analytics
```

---

**Documento criado em:** 28/11/2024  
**Versão:** 1.0  
**Status:** Especificação completa - Pronta para implementação  
**Estimativa:** 28-32 horas (5 story points)
