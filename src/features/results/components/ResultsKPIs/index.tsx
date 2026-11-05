"use client";

import { RefreshIcon, AlertCircleIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Button, MetricsGrid } from "@/components/ui";
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
    loadingLabel,
  } = useResultsKPIsVM(props);

  if (isLoading) {
    return (
      <MetricsGrid
        items={[
          { id: "total-completed", label: labelTotalCompleted, value: "" },
          { id: "average-score", label: labelAverageScore, value: "" },
        ]}
        isLoading
        loadingLabel={loadingLabel}
      />
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
    <MetricsGrid
      items={[
        {
          id: "total-completed",
          label: labelTotalCompleted,
          value: totalCompleted ?? 0,
        },
        {
          id: "average-score",
          label: labelAverageScore,
          value: averageScore ?? 0,
        },
      ]}
      loadingLabel={loadingLabel}
    />
  );
}
