/**
 * Analytics Dashboard Page
 * Dashboard avançado de analytics com métricas de performance
 *
 * Seguindo Clean Code:
 * - Componentes compostos
 * - Lógica extraída para hooks
 * - Loading e error states
 * - Responsivo
 */

'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PerformanceMetricCard } from '@/components/analytics/performance-metric-card';
import { useAllAnalytics } from '@/hooks/useAnalytics';
import { TrendingUp, DollarSign, Clock, BarChart3 } from 'lucide-react';
import type { AnalyticsPeriod } from '@/types/analytics';

// ============================================
// Period Selector Component
// ============================================

interface PeriodSelectorProps {
  value: AnalyticsPeriod;
  onChange: (period: AnalyticsPeriod) => void;
}

function PeriodSelector({ value, onChange }: PeriodSelectorProps) {
  const periods: { value: AnalyticsPeriod; label: string }[] = [
    { value: '7d', label: 'Últimos 7 dias' },
    { value: '30d', label: 'Últimos 30 dias' },
    { value: '90d', label: 'Últimos 90 dias' },
  ];

  return (
    <div className="flex gap-2">
      {periods.map((period) => (
        <button
          key={period.value}
          onClick={() => onChange(period.value)}
          className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
            value === period.value
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted hover:bg-muted/80'
          }`}
        >
          {period.label}
        </button>
      ))}
    </div>
  );
}

// ============================================
// Loading State Component
// ============================================

function LoadingState() {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-sm text-muted-foreground">Carregando analytics...</p>
      </div>
    </div>
  );
}

// ============================================
// Error State Component
// ============================================

function ErrorState({ message }: { message: string }) {
  return (
    <Card className="border-destructive">
      <CardContent className="pt-6">
        <p className="text-sm text-destructive">{message}</p>
      </CardContent>
    </Card>
  );
}

// ============================================
// Main Page Component
// ============================================

export default function AnalyticsPage() {
  const [period, setPeriod] = useState<AnalyticsPeriod>('30d');

  const { performance, pipeline, revenue, forecast, isAnyLoading, hasAnyError } = useAllAnalytics({
    period,
  });

  return (
    <div className="container mx-auto py-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analytics Avançado</h1>
          <p className="text-muted-foreground">
            Análise completa de performance, receita e projeções futuras
          </p>
        </div>

        <PeriodSelector value={period} onChange={setPeriod} />
      </div>

      {/* Loading State */}
      {isAnyLoading && <LoadingState />}

      {/* Error State */}
      {hasAnyError && (
        <ErrorState message="Erro ao carregar dados de analytics. Tente novamente." />
      )}

      {/* Content */}
      {!isAnyLoading && !hasAnyError && (
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="revenue">Receita</TabsTrigger>
            <TabsTrigger value="pipeline">Pipeline</TabsTrigger>
            <TabsTrigger value="forecast">Forecast</TabsTrigger>
            <TabsTrigger value="trends">Tendências</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* KPI Cards */}
            <div className="grid gap-4 md:grid-cols-3">
              {performance.data && (
                <>
                  <PerformanceMetricCard
                    title="Taxa de Fechamento"
                    value={performance.data.winRate.current}
                    trend={performance.data.winRate}
                    icon={<TrendingUp className="h-4 w-4 text-muted-foreground" />}
                    format="percent"
                  />

                  <PerformanceMetricCard
                    title="Ticket Médio"
                    value={performance.data.averageTicket.current}
                    trend={performance.data.averageTicket}
                    icon={<DollarSign className="h-4 w-4 text-muted-foreground" />}
                    format="currency"
                  />

                  <PerformanceMetricCard
                    title="Ciclo de Vendas"
                    value={performance.data.salesCycle.current}
                    trend={performance.data.salesCycle}
                    icon={<Clock className="h-4 w-4 text-muted-foreground" />}
                    format="days"
                  />
                </>
              )}
            </div>

            {/* Revenue Chart Placeholder */}
            <Card>
              <CardHeader>
                <CardTitle>Receita Realizada vs Esperada</CardTitle>
                <CardDescription>Comparação entre receita realizada e projeções</CardDescription>
              </CardHeader>
              <CardContent>
                {revenue.data ? (
                  <div className="h-[300px] flex items-center justify-center bg-muted/20 rounded-lg">
                    <div className="text-center">
                      <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">
                        Gráfico de receita (implementar Recharts)
                      </p>
                      <div className="mt-4 grid grid-cols-2 gap-4 text-left">
                        <div>
                          <p className="text-xs text-muted-foreground">Realizada</p>
                          <p className="text-2xl font-bold">
                            {new Intl.NumberFormat('pt-BR', {
                              style: 'currency',
                              currency: 'BRL',
                            }).format(revenue.data.realized.total)}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Esperada</p>
                          <p className="text-2xl font-bold">
                            {new Intl.NumberFormat('pt-BR', {
                              style: 'currency',
                              currency: 'BRL',
                            }).format(revenue.data.expected.total)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <LoadingState />
                )}
              </CardContent>
            </Card>

            {/* Pipeline Distribution */}
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Distribuição do Pipeline</CardTitle>
                  <CardDescription>Por valor (R$)</CardDescription>
                </CardHeader>
                <CardContent>
                  {pipeline.data ? (
                    <div className="space-y-2">
                      {pipeline.data.byValue.map((stage) => (
                        <div key={stage.stage} className="flex items-center justify-between">
                          <span className="text-sm">{stage.stageName}</span>
                          <div className="flex items-center gap-2">
                            <div className="text-right">
                              <p className="text-sm font-medium">
                                {new Intl.NumberFormat('pt-BR', {
                                  style: 'currency',
                                  currency: 'BRL',
                                  minimumFractionDigits: 0,
                                }).format(stage.value)}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {stage.percentage.toFixed(1)}%
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <LoadingState />
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Forecast 3 Meses</CardTitle>
                  <CardDescription>Projeção realista</CardDescription>
                </CardHeader>
                <CardContent>
                  {forecast.data ? (
                    <div className="space-y-4">
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Confiança da Projeção</p>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-muted rounded-full h-2">
                            <div
                              className="bg-primary h-2 rounded-full"
                              style={{ width: `${forecast.data.confidence}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium">{forecast.data.confidence}%</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-4 text-center pt-4">
                        {forecast.data.forecast.slice(0, 3).map((month) => (
                          <div key={month.month}>
                            <p className="text-xs text-muted-foreground mb-1">{month.month}</p>
                            <p className="text-lg font-bold">
                              {new Intl.NumberFormat('pt-BR', {
                                style: 'currency',
                                currency: 'BRL',
                                minimumFractionDigits: 0,
                                maximumFractionDigits: 0,
                              }).format(month.realistic)}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <LoadingState />
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Other Tabs - Placeholder */}
          <TabsContent value="revenue">
            <Card>
              <CardContent className="pt-6">
                <p className="text-muted-foreground text-center py-8">
                  Análise detalhada de receita (implementar gráficos Recharts)
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="pipeline">
            <Card>
              <CardContent className="pt-6">
                <p className="text-muted-foreground text-center py-8">
                  Análise detalhada do pipeline (implementar gráficos Recharts)
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="forecast">
            <Card>
              <CardContent className="pt-6">
                <p className="text-muted-foreground text-center py-8">
                  Projeções detalhadas (implementar gráficos Recharts)
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="trends">
            <Card>
              <CardContent className="pt-6">
                <p className="text-muted-foreground text-center py-8">
                  Análise de tendências históricas (implementar gráficos Recharts)
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
