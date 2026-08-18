"use client";

import { RefreshIcon, AlertCircleIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Button } from "@/components/ui/button";
import { useResultsKPIsVM } from "./resultsKPIs.viewmodel";
import type { ResultsKPIsProps } from "./resultsKPIs.types";

export function ResultsKPIs(props: ResultsKPIsProps) {
  const {
    totalCompleted,
    averageScore,
    isLoading,
    isError,
    onRetry,
    labelTotalCompleted,
    labelAverageScore,
    retryButtonText,
    errorMessage,
  } = useResultsKPIsVM(props);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-pulse">
        <div className="h-32 rounded-[2rem] border border-border/40 bg-muted/50 p-6" />
        <div className="h-32 rounded-[2rem] border border-border/40 bg-muted/50 p-6" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-[2rem] border border-destructive/30 bg-destructive/10 p-6 text-destructive flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <HugeiconsIcon icon={AlertCircleIcon} size={24} className="shrink-0" />
          <p className="text-sm font-medium">{errorMessage}</p>
        </div>
        {onRetry && (
          <Button
            onClick={onRetry}
            variant="outline"
            size="sm"
            className="border-destructive/30 text-destructive hover:bg-destructive/20 text-xs shrink-0"
          >
            <HugeiconsIcon icon={RefreshIcon} size={14} className="mr-1.5" />
            {retryButtonText}
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Card 1: Jornadas Concluídas */}
      <div className="rounded-[2rem] border border-border bg-card/80 p-6 shadow-sm backdrop-blur-xl">
        <h3
          id="kpi-total-completed-label"
          className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
        >
          {labelTotalCompleted}
        </h3>
        <p
          aria-labelledby="kpi-total-completed-label"
          className="mt-2 text-4xl font-extrabold tracking-tight text-foreground font-heading"
        >
          {totalCompleted ?? 0}
        </p>
      </div>

      {/* Card 2: Média das Notas */}
      <div className="rounded-[2rem] border border-border bg-card/80 p-6 shadow-sm backdrop-blur-xl">
        <h3
          id="kpi-average-score-label"
          className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
        >
          {labelAverageScore}
        </h3>
        <p
          aria-labelledby="kpi-average-score-label"
          className="mt-2 text-4xl font-extrabold tracking-tight text-foreground font-heading"
        >
          {averageScore ?? 0}
        </p>
      </div>
    </div>
  );
}
