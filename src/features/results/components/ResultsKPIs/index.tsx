"use client";

import { useResultsKPIsVM } from "./resultsKPIs.viewmodel";
import type { ResultsKPIsProps } from "./resultsKPIs.types";

export function ResultsKPIs(props: ResultsKPIsProps) {
  const {
    totalCompleted,
    averageScore,
    isLoading,
    labelTotalCompleted,
    labelAverageScore,
  } = useResultsKPIsVM(props);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-pulse">
        <div className="h-32 rounded-[2rem] border border-border/40 bg-muted/50 p-6" />
        <div className="h-32 rounded-[2rem] border border-border/40 bg-muted/50 p-6" />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Card 1: Jornadas Concluídas */}
      <div className="rounded-[2rem] border border-border bg-card/80 p-6 shadow-sm backdrop-blur-xl">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {labelTotalCompleted}
        </p>
        <p className="mt-2 text-4xl font-extrabold tracking-tight text-foreground font-heading">
          {totalCompleted}
        </p>
      </div>

      {/* Card 2: Média das Notas */}
      <div className="rounded-[2rem] border border-border bg-card/80 p-6 shadow-sm backdrop-blur-xl">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {labelAverageScore}
        </p>
        <p className="mt-2 text-4xl font-extrabold tracking-tight text-foreground font-heading">
          {averageScore}
        </p>
      </div>
    </div>
  );
}
