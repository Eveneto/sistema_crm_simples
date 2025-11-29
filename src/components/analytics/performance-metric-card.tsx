/**
 * Performance Metrics Card
 * Exibe métricas de performance com tendência
 * 
 * Seguindo Clean Code:
 * - Single Responsibility (apenas exibição de métrica)
 * - Props bem tipadas
 * - Componente pequeno e reutilizável
 * - Nomes descritivos
 */

'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowUp, ArrowDown, Minus } from 'lucide-react';
import type { MetricWithTrend } from '@/types/analytics';

// ============================================
// Types
// ============================================

interface PerformanceMetricCardProps {
  title: string;
  value: string | number;
  trend: MetricWithTrend;
  icon?: React.ReactNode;
  format?: 'currency' | 'percent' | 'number' | 'days';
}

// ============================================
// Helper: Format Value
// ============================================

function formatMetricValue(value: number, format: PerformanceMetricCardProps['format']): string {
  switch (format) {
    case 'currency':
      return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
      }).format(value);

    case 'percent':
      return `${value}%`;

    case 'days':
      return `${value} dias`;

    case 'number':
    default:
      return value.toString();
  }
}

// ============================================
// Helper: Get Trend Icon
// ============================================

function getTrendIcon(trend: 'up' | 'down' | 'stable') {
  const iconClass = 'h-4 w-4';

  switch (trend) {
    case 'up':
      return <ArrowUp className={`${iconClass} text-green-600`} />;
    case 'down':
      return <ArrowDown className={`${iconClass} text-red-600`} />;
    case 'stable':
      return <Minus className={`${iconClass} text-gray-400`} />;
  }
}

// ============================================
// Helper: Get Trend Color
// ============================================

function getTrendColor(trend: 'up' | 'down' | 'stable'): string {
  switch (trend) {
    case 'up':
      return 'text-green-600';
    case 'down':
      return 'text-red-600';
    case 'stable':
      return 'text-gray-400';
  }
}

// ============================================
// Component
// ============================================

export function PerformanceMetricCard({
  title,
  value,
  trend,
  icon,
  format = 'number',
}: PerformanceMetricCardProps) {
  const formattedValue =
    typeof value === 'number' ? formatMetricValue(value, format) : value;

  const trendSign = trend.change > 0 ? '+' : '';
  const trendColor = getTrendColor(trend.trend);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>

      <CardContent>
        <div className="text-2xl font-bold">{formattedValue}</div>

        <div className="flex items-center gap-1 mt-2 text-xs">
          {getTrendIcon(trend.trend)}
          <span className={trendColor}>
            {trendSign}
            {trend.change}%
          </span>
          <span className="text-muted-foreground ml-1">vs. período anterior</span>
        </div>

        {/* Sparkline (futuro) */}
        {trend.sparkline && (
          <div className="mt-3 h-8">
            {/* TODO: Implementar mini sparkline usando Recharts */}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
