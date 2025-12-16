'use client';

import { Users, MessageSquare, TrendingUp, DollarSign } from 'lucide-react';
import { KPICard } from './kpi-card';
import { formatCompactCurrency } from '@/lib/format';
import { useDashboardMetrics } from '@/hooks/use-dashboard-query';

export type PeriodFilter = '7d' | '30d' | '90d';

interface DashboardGridProps {
  period?: PeriodFilter;
}

export function DashboardGrid({ period = '30d' }: DashboardGridProps) {
  // React Query com cache automático e refetch on focus
  const { data: metrics, isLoading } = useDashboardMetrics(period as any);

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <KPICard
        title="Total de Vendas"
        value={metrics ? formatCompactCurrency(metrics.totalSales) : 'R$ 0'}
        description="Negócios ganhos"
        icon={DollarSign}
        trend={
          metrics
            ? {
                value: metrics.trends.sales,
                isPositive: metrics.trends.sales >= 0,
              }
            : undefined
        }
        isLoading={isLoading}
      />

      <KPICard
        title="Total de Contatos"
        value={metrics?.totalContacts ?? 0}
        description="Contatos cadastrados"
        icon={Users}
        trend={
          metrics
            ? {
                value: metrics.trends.contacts,
                isPositive: metrics.trends.contacts >= 0,
              }
            : undefined
        }
        isLoading={isLoading}
      />

      <KPICard
        title="Conversas Ativas"
        value={metrics?.activeConversations ?? 0}
        description="Em andamento"
        icon={MessageSquare}
        trend={
          metrics
            ? {
                value: metrics.trends.conversations,
                isPositive: metrics.trends.conversations >= 0,
              }
            : undefined
        }
        isLoading={isLoading}
      />

      <KPICard
        title="Taxa de Conversão"
        value={metrics ? `${metrics.conversionRate}%` : '0%'}
        description="Negócios ganhos/total"
        icon={TrendingUp}
        trend={
          metrics
            ? {
                value: metrics.trends.conversion,
                isPositive: metrics.trends.conversion >= 0,
              }
            : undefined
        }
        isLoading={isLoading}
      />
    </div>
  );
}
