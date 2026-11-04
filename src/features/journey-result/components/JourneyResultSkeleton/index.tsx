"use client";

import { useJourneyResultSkeletonVM } from "./journeyResultSkeleton.viewmodel";

/** Esqueleto da tela; a região de carregamento (aria-busy) fica na View. */
export function JourneyResultSkeleton() {
  const { sectionKeys, areaCardKeys } = useJourneyResultSkeletonVM();

  return (
    <div aria-hidden="true" data-testid="journey-result-skeleton" className="animate-pulse space-y-6">
      <div className="rounded-[2rem] border border-border/40 bg-muted/50 p-8">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-2xl bg-muted-foreground/20" />
          <div className="space-y-2">
            <div className="h-3 w-24 rounded bg-muted-foreground/20" />
            <div className="h-5 w-56 max-w-full rounded bg-muted-foreground/20" />
          </div>
        </div>
        <div className="mt-6 h-4 w-32 rounded bg-muted-foreground/20" />
        <div className="mt-2 h-2 w-full rounded-full bg-muted-foreground/20" />
        <div className="mt-6 flex gap-3">
          <div className="h-9 w-44 rounded-full bg-muted-foreground/20" />
          <div className="h-9 w-24 rounded-full bg-muted-foreground/10" />
        </div>
      </div>

      <div className="rounded-[2rem] border border-border/40 bg-muted/50 p-8">
        <div className="h-3 w-48 rounded bg-muted-foreground/20" />
        <div className="mt-2 h-6 w-64 max-w-full rounded bg-muted-foreground/20" />
        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {areaCardKeys.map((key) => (
            <div key={key} className="h-28 rounded-2xl bg-muted-foreground/10" />
          ))}
        </div>
      </div>

      {sectionKeys.map((key) => (
        <div key={key} className="rounded-[2rem] border border-border/40 bg-muted/50 p-8">
          <div className="h-3 w-40 rounded bg-muted-foreground/20" />
          <div className="mt-2 h-6 w-72 max-w-full rounded bg-muted-foreground/20" />
        </div>
      ))}
    </div>
  );
}
