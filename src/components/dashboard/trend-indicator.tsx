import { cn } from '@/lib/utils';

export interface TrendIndicatorProps {
  value: number;
  isPositive: boolean;
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
}

export function TrendIndicator({
  value,
  isPositive,
  label = 'vs período anterior',
  size = 'sm',
  showIcon = true,
}: TrendIndicatorProps) {
  const sizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  };

  return (
    <div className="flex items-center gap-1">
      <span
        className={cn(
          'font-medium',
          sizeClasses[size],
          isPositive ? 'text-green-600 dark:text-green-500' : 'text-red-600 dark:text-red-500'
        )}
      >
        {showIcon && (isPositive ? '↑' : '↓')} {Math.abs(value).toFixed(1)}%
      </span>
      {label && <span className={cn('text-muted-foreground', sizeClasses[size])}>{label}</span>}
    </div>
  );
}
