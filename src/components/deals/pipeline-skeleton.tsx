import { Skeleton } from '@/components/ui/skeleton'

/**
 * Skeleton loader para o Pipeline Board
 * Mostra estrutura visual enquanto carrega dados
 */
export function PipelineSkeleton() {
  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {/* Simula 4 colunas */}
      {[1, 2, 3, 4].map((col) => (
        <div
          key={col}
          className="flex-shrink-0 w-80 bg-muted/30 rounded-lg p-4"
        >
          {/* Header da coluna */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Skeleton className="h-3 w-3 rounded-full" />
              <Skeleton className="h-5 w-32" />
            </div>
            <Skeleton className="h-5 w-16" />
          </div>

          {/* Cards skeleton */}
          <div className="space-y-3">
            {[1, 2, 3].map((card) => (
              <div
                key={card}
                className="bg-background rounded-lg border p-4 space-y-3"
              >
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <div className="flex items-center justify-between pt-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-6 w-16 rounded-full" />
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

/**
 * Skeleton loader compacto para uma única coluna
 * Útil para loading incremental
 */
export function PipelineColumnSkeleton() {
  return (
    <div className="flex-shrink-0 w-80 bg-muted/30 rounded-lg p-4 animate-pulse">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Skeleton className="h-3 w-3 rounded-full" />
          <Skeleton className="h-5 w-32" />
        </div>
        <Skeleton className="h-5 w-16" />
      </div>

      <div className="space-y-3">
        {[1, 2].map((card) => (
          <div
            key={card}
            className="bg-background rounded-lg border p-4 space-y-2"
          >
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        ))}
      </div>
    </div>
  )
}
