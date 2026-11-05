import { cn } from "@/shared/lib/utils";
import type { MetricsGridProps } from "./metricsGrid.types";

export function MetricsGrid({
  items,
  isLoading = false,
  loadingLabel,
  className,
}: MetricsGridProps) {
  if (isLoading) {
    return (
      <div
        aria-busy="true"
        aria-label={loadingLabel}
        className={cn("grid grid-cols-1 gap-6 md:grid-cols-2", className)}
      >
        {items.map((item) => (
          <div
            key={item.id}
            className="h-32 animate-pulse rounded-[2rem] border border-border/40 bg-muted/50 p-6"
          />
        ))}
      </div>
    );
  }

  return (
    <div className={cn("grid grid-cols-1 gap-6 md:grid-cols-2", className)}>
      {items.map((item) => (
        <article
          key={item.id}
          className="rounded-[2rem] border border-border bg-card/80 p-6 shadow-sm backdrop-blur-xl"
        >
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {item.label}
          </h3>
          <p className="mt-2 font-heading text-4xl font-extrabold tracking-tight text-foreground">
            {item.value}
          </p>
        </article>
      ))}
    </div>
  );
}
