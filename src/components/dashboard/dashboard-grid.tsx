'use client';

import { useState, useEffect } from 'react';
import { Users, MessageSquare, TrendingUp, DollarSign } from 'lucide-react';
import { KPICard } from './kpi-card';
import { formatCompactCurrency } from '@/lib/format';

export type PeriodFilter = '7d' | '30d' | '90d';

interface DashboardMetrics {
  totalContacts: number;
  activeConversations: number;
  conversionRate: number;
  newContacts: number;
  totalSales: number;
  trends: {
    contacts: number;
    conversations: number;
    conversion: number;
    newContacts: number;
    sales: number;
  };
}

interface DashboardGridProps {
  period?: PeriodFilter;
}

export function DashboardGrid({ period = '30d' }: DashboardGridProps) {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadMetrics() {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/dashboard/overview?period=${period}`);
        if (response.ok) {
          const data = await response.json();
          setMetrics(data);
        }
      } catch (error) {
        // Log error for debugging
        if (error instanceof Error) {
          console.error('Error loading metrics:', error.message);
        }
      } finally {
        setIsLoading(false);
      }
    }

    loadMetrics();
  }, [period]);

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
