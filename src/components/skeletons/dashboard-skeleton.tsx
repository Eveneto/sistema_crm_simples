export function DashboardSkeleton() {
  return (
    <div className="space-y-8">
      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        {Array(4)
          .fill(0)
          .map((_, i) => (
            <div key={i} className="rounded-lg border bg-card p-4 animate-pulse">
              <div className="h-4 w-24 bg-muted-foreground/20 rounded mb-2" />
              <div className="h-8 w-32 bg-muted-foreground/20 rounded" />
            </div>
          ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {Array(2)
          .fill(0)
          .map((_, i) => (
            <div key={i} className="rounded-lg border bg-card p-4 animate-pulse">
              <div className="h-4 w-32 bg-muted-foreground/20 rounded mb-4" />
              <div className="h-64 bg-muted-foreground/10 rounded" />
            </div>
          ))}
      </div>

      {/* List */}
      <div className="rounded-lg border bg-card p-4 animate-pulse">
        <div className="h-4 w-32 bg-muted-foreground/20 rounded mb-4" />
        <div className="space-y-2">
          {Array(5)
            .fill(0)
            .map((_, i) => (
              <div key={i} className="h-4 w-full bg-muted-foreground/10 rounded" />
            ))}
        </div>
      </div>
    </div>
  );
}
