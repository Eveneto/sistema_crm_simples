import { Skeleton } from '@/components/ui/skeleton';

interface CardSkeletonProps {
  count?: number;
  className?: string;
  height?: string;
}

/**
 * Generic card skeleton loader
 * Reusable for any card-based content
 */
export function CardSkeleton({ count = 1, className = '', height = 'h-64' }: CardSkeletonProps) {
  return (
    <div className={`grid gap-4 ${className}`}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className={`rounded-lg border bg-card p-6 space-y-4 ${height}`}>
          {/* Header skeleton */}
          <div className="space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>

          {/* Content skeleton */}
          <div className="space-y-2">
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-5/6" />
          </div>

          {/* Footer skeleton */}
          <div className="flex gap-2 pt-4">
            <Skeleton className="h-8 w-16" />
            <Skeleton className="h-8 w-16" />
          </div>
        </div>
      ))}
    </div>
  );
}
