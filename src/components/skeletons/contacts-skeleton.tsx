export function ContactsSkeleton() {
  return (
    <div className="space-y-2">
      {Array(6)
        .fill(0)
        .map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-4 p-3 rounded-lg bg-muted animate-pulse"
          >
            <div className="h-10 w-10 rounded-full bg-muted-foreground/20" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-32 bg-muted-foreground/20 rounded" />
              <div className="h-3 w-24 bg-muted-foreground/20 rounded" />
            </div>
            <div className="h-6 w-16 bg-muted-foreground/20 rounded" />
          </div>
        ))}
    </div>
  );
}
