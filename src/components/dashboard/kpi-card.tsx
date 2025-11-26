import { LucideIcon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendIndicator } from './trend-indicator';

export interface KPICardProps {
  title: string;
  value: string | number;
  description?: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  isLoading?: boolean;
}

export function KPICard({
  title,
  value,
  description,
  icon: Icon,
  trend,
  isLoading = false,
}: KPICardProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            <div className="h-4 w-24 animate-pulse rounded bg-muted" />
          </CardTitle>
          <div className="h-4 w-4 animate-pulse rounded bg-muted" />
        </CardHeader>
        <CardContent>
          <div className="h-8 w-20 animate-pulse rounded bg-muted" />
          <div className="mt-2 h-3 w-32 animate-pulse rounded bg-muted" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && <p className="text-xs text-muted-foreground mt-1">{description}</p>}
        {trend && (
          <div className="mt-2">
            <TrendIndicator value={trend.value} isPositive={trend.isPositive} />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
