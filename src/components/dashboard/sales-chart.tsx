'use client';

import { useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  TooltipProps,
} from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/format';

type Granularity = 'daily' | 'weekly' | 'monthly';
type Period = '7d' | '30d' | '90d';

interface SalesDataPoint {
  date: string;
  value: number;
  count: number;
}

interface SalesResponse {
  data: SalesDataPoint[];
  period: string;
  granularity: string;
  total: number;
}

const periodLabels: Record<Period, string> = {
  '7d': '7 dias',
  '30d': '30 dias',
  '90d': '90 dias',
};

const granularityLabels: Record<Granularity, string> = {
  daily: 'Diário',
  weekly: 'Semanal',
  monthly: 'Mensal',
};

export function SalesChart() {
  const [period, setPeriod] = useState<Period>('30d');
  const [granularity, setGranularity] = useState<Granularity>('daily');
  const [data, setData] = useState<SalesDataPoint[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSalesData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/dashboard/sales?period=${period}&granularity=${granularity}`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch sales data');
      }

      const result: SalesResponse = await response.json();
      setData(result.data);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An error occurred');
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSalesData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [period, granularity]);

  const formatXAxis = (dateStr: string) => {
    if (granularity === 'monthly') {
      const [year, month] = dateStr.split('-');
      const date = new Date(parseInt(year), parseInt(month) - 1);
      return date.toLocaleDateString('pt-BR', { month: 'short' });
    } else {
      const date = new Date(dateStr);
      return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
    }
  };

  const formatYAxis = (value: number) => {
    if (value >= 1000000) {
      return `R$ ${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
      return `R$ ${(value / 1000).toFixed(0)}K`;
    }
    return `R$ ${value}`;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle>Vendas ao Longo do Tempo</CardTitle>
            <CardDescription>Evolução das vendas fechadas</CardDescription>
          </div>
          <div className="flex flex-wrap gap-2">
            <div className="flex gap-1 rounded-lg bg-muted p-1">
              {(['7d', '30d', '90d'] as Period[]).map((p) => (
                <Button
                  key={p}
                  variant={period === p ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setPeriod(p)}
                  className="h-7"
                >
                  {periodLabels[p]}
                </Button>
              ))}
            </div>
            <div className="flex gap-1 rounded-lg bg-muted p-1">
              {(['daily', 'weekly', 'monthly'] as Granularity[]).map((g) => (
                <Button
                  key={g}
                  variant={granularity === g ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setGranularity(g)}
                  className="h-7"
                >
                  {granularityLabels[g]}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading && (
          <div className="flex h-[300px] items-center justify-center">
            <div className="animate-pulse text-muted-foreground">Carregando dados...</div>
          </div>
        )}

        {error && (
          <div className="flex h-[300px] items-center justify-center">
            <div className="text-destructive">Erro ao carregar dados: {error}</div>
          </div>
        )}

        {!isLoading && !error && data.length === 0 && (
          <div className="flex h-[300px] items-center justify-center">
            <div className="text-center text-muted-foreground">
              <p className="text-lg font-medium">Nenhuma venda encontrada</p>
              <p className="text-sm">Não há dados para o período selecionado</p>
            </div>
          </div>
        )}

        {!isLoading && !error && data.length > 0 && (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis
                dataKey="date"
                tickFormatter={formatXAxis}
                className="text-xs"
                stroke="currentColor"
              />
              <YAxis tickFormatter={formatYAxis} className="text-xs" stroke="currentColor" />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey="value"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                dot={{ fill: 'hsl(var(--primary))', r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}

function CustomTooltip({ active, payload }: TooltipProps<number, string>) {
  if (!active || !payload || !payload.length) {
    return null;
  }

  const data = payload[0].payload as SalesDataPoint;

  return (
    <div className="rounded-lg border bg-background p-3 shadow-lg">
      <p className="mb-1 text-sm font-medium">
        {new Date(data.date).toLocaleDateString('pt-BR', {
          day: '2-digit',
          month: 'long',
          year: 'numeric',
        })}
      </p>
      <p className="text-lg font-bold text-primary">{formatCurrency(data.value)}</p>
      <p className="text-xs text-muted-foreground">
        {data.count} {data.count === 1 ? 'venda' : 'vendas'}
      </p>
    </div>
  );
}
