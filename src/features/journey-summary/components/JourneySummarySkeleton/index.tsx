"use client";

import { useJourneySummarySkeletonVM } from "./journeySummarySkeleton.viewmodel";

export function JourneySummarySkeleton() {
  const { statCardKeys, stepKeys } = useJourneySummarySkeletonVM();

  return (
    <div
      aria-busy="true"
      data-testid="journey-summary-skeleton"
      className="animate-pulse space-y-6"
    >
      <div className="rounded-[2rem] border border-border/40 bg-muted/50 p-8">
        <div
          aria-hidden="true"
          className="h-5 w-40 rounded-full bg-muted-foreground/20"
        />
        <div
          aria-hidden="true"
          className="mt-4 h-8 w-2/3 rounded bg-muted-foreground/20"
        />

        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {statCardKeys.map((key) => (
            <div
              key={key}
              aria-hidden="true"
              className="h-24 rounded-2xl bg-muted-foreground/10"
            />
          ))}
        </div>
      </div>

      <div className="space-y-5 rounded-[2rem] border border-border/40 bg-muted/50 p-8">
        <div
          aria-hidden="true"
          className="h-6 w-48 rounded bg-muted-foreground/20"
        />
        <div
          aria-hidden="true"
          className="h-4 w-80 max-w-full rounded bg-muted-foreground/20"
        />
        {stepKeys.map((key) => (
          <div
            key={key}
            aria-hidden="true"
            className="h-10 w-full rounded bg-muted-foreground/10"
          />
        ))}
      </div>
    </div>
  );
}
