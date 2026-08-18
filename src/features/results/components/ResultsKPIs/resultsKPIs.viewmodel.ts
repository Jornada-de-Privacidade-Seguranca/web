import type { ResultsKPIsProps } from "./resultsKPIs.types";

export function useResultsKPIsVM(props: ResultsKPIsProps) {
  const { metrics, isLoading, isError = false, onRetry, labels } = props;

  const totalCompleted = metrics?.totalCompleted ?? null;
  const averageScore = metrics?.averageScore ?? null;

  return {
    totalCompleted,
    averageScore,
    isLoading,
    isError: isError || (metrics === null && !isLoading),
    onRetry,
    labelTotalCompleted: labels.kpiTotalCompleted,
    labelAverageScore: labels.kpiAverageScore,
    retryButtonText: labels.retryButton,
    errorMessage: labels.errorMetricsMessage,
  };
}
