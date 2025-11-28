'use client';

import { useEffect, useState } from 'react';
import { ConversionReport } from '@/app/api/reports/conversion/route';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, TrendingUp, Clock, DollarSign, Target } from 'lucide-react';
import { logger } from '@/lib/logger';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
} from 'recharts';

const stageLabels: Record<string, string> = {
  lead: 'Lead',
  qualified: 'Qualificado',
  proposal: 'Proposta',
  negotiation: 'Negociação',
  won: 'Ganho',
  lost: 'Perdido',
};

export function ConversionReport() {
  const [report, setReport] = useState<ConversionReport | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReport = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await fetch('/api/reports/conversion');

        if (!response.ok) {
          throw new Error('Erro ao buscar relatório');
        }

        const data = await response.json();
        setReport(data);

        logger.info('Relatório de conversão carregado');
      } catch (err) {
        logger.error('Erro ao carregar relatório:', { err });
        setError(err instanceof Error ? err.message : 'Erro desconhecido');
      } finally {
        setIsLoading(false);
      }
    };

    fetchReport();
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-32" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-24" />
              </CardContent>
            </Card>
          ))}
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-80 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !report) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error || 'Erro ao carregar relatório'}</AlertDescription>
      </Alert>
    );
  }

  // Preparar dados para os gráficos
  const chartData = report.metrics
    .filter((m) => m.stage !== 'lost') // Não mostrar 'lost' no funil principal
    .map((metric) => ({
      stage: stageLabels[metric.stage] || metric.stage,
      quantidade: metric.count,
      valor: metric.value,
      conversao: metric.conversionRate,
      tempoMedio: metric.avgTimeInStage,
    }));

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  return (
    <div className="space-y-6">
      {/* Cards de métricas principais */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Negócios</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{report.totalDeals}</div>
            <p className="text-xs text-muted-foreground">No funil de vendas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Valor Total</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(report.totalValue)}</div>
            <p className="text-xs text-muted-foreground">Em negócios ativos</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Conversão</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatPercentage(report.overallConversionRate)}
            </div>
            <p className="text-xs text-muted-foreground">Lead → Ganho</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ciclo Médio</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{report.avgSalesCycle.toFixed(1)} dias</div>
            <p className="text-xs text-muted-foreground">Tempo médio de fechamento</p>
          </CardContent>
        </Card>
      </div>

      {/* Gráfico de funil - quantidade por estágio */}
      <Card>
        <CardHeader>
          <CardTitle>Funil de Conversão - Quantidade</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="stage" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="quantidade" fill="#3b82f6" name="Quantidade de Negócios" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Gráfico de taxa de conversão por estágio */}
      <Card>
        <CardHeader>
          <CardTitle>Taxa de Conversão por Estágio</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="stage" />
              <YAxis />
              <Tooltip formatter={(value: number) => `${value.toFixed(1)}%`} />
              <Legend />
              <Line
                type="monotone"
                dataKey="conversao"
                stroke="#10b981"
                name="Taxa de Conversão (%)"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Gráfico de valor por estágio */}
      <Card>
        <CardHeader>
          <CardTitle>Valor por Estágio</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="stage" />
              <YAxis />
              <Tooltip formatter={(value: number) => formatCurrency(value)} />
              <Legend />
              <Bar dataKey="valor" fill="#8b5cf6" name="Valor Total (R$)" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Tabela detalhada de métricas */}
      <Card>
        <CardHeader>
          <CardTitle>Detalhamento por Estágio</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2 font-medium">Estágio</th>
                  <th className="text-right p-2 font-medium">Quantidade</th>
                  <th className="text-right p-2 font-medium">Valor</th>
                  <th className="text-right p-2 font-medium">Taxa Conversão</th>
                  <th className="text-right p-2 font-medium">Tempo Médio</th>
                </tr>
              </thead>
              <tbody>
                {report.metrics
                  .filter((m) => m.stage !== 'lost')
                  .map((metric) => (
                    <tr key={metric.stage} className="border-b">
                      <td className="p-2">{stageLabels[metric.stage] || metric.stage}</td>
                      <td className="text-right p-2">{metric.count}</td>
                      <td className="text-right p-2">{formatCurrency(metric.value)}</td>
                      <td className="text-right p-2">{formatPercentage(metric.conversionRate)}</td>
                      <td className="text-right p-2">{metric.avgTimeInStage.toFixed(1)} dias</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
