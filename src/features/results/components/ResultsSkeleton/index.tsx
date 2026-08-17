"use client";

import { useResultsSkeletonVM } from "./resultsSkeleton.viewmodel";
import type { ResultsSkeletonProps } from "./resultsSkeleton.types";

export function ResultsSkeleton(props: ResultsSkeletonProps) {
  const { items } = useResultsSkeletonVM(props);

  return (
    <div
      aria-busy="true"
      data-testid="results-skeleton"
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse"
    >
      {items.map((key) => (
        <div
          key={key}
          className="flex flex-col justify-between rounded-[2rem] border border-border/40 bg-muted/50 p-6 h-64"
        >
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <div className="h-6 w-3/4 rounded bg-muted-foreground/20" />
              <div className="h-5 w-10 rounded-full bg-muted-foreground/20" />
            </div>
            <div className="h-4 w-full rounded bg-muted-foreground/20" />
            <div className="h-4 w-2/3 rounded bg-muted-foreground/20" />
          </div>
          <div className="border-t border-border/40 pt-4 flex gap-4">
            <div className="h-4 w-24 rounded bg-muted-foreground/20" />
            <div className="h-4 w-20 rounded bg-muted-foreground/20" />
          </div>
        </div>
      ))}
    </div>
  );
}
