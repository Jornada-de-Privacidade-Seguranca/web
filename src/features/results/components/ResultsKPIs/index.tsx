"use client";

import { RefreshIcon, AlertCircleIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Button, MetricsGrid } from "@/components/ui";
import { useResultsKPIsVM } from "./resultsKPIs.viewmodel";
import type { ResultsKPIsProps } from "./resultsKPIs.types";

export function ResultsKPIs(props: ResultsKPIsProps) {
  const {
    items,
    isLoading,
    isError,
    onRetry,
    retryButtonText,
    errorMessage,
    loadingLabel,
  } = useResultsKPIsVM(props);

  if (isLoading) {
    return (
      <MetricsGrid
        items={[
          { id: "loading-1", label: "", value: "" },
          { id: "loading-2", label: "", value: "" },
          { id: "loading-3", label: "", value: "" },
          { id: "loading-4", label: "", value: "" },
        ]}
        isLoading
        loadingLabel={loadingLabel}
        className="grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
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
      items={items}
      loadingLabel={loadingLabel}
      className="grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
    />
  );
}

export * from "./resultsKPIs.types";
