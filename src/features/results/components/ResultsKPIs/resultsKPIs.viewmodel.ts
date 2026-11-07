import type {
  ResultsKPIsProps,
  ResultsKPIsViewModelReturn,
  KPIItem,
} from "./resultsKPIs.types";

export function useResultsKPIsVM(
  props: ResultsKPIsProps
): ResultsKPIsViewModelReturn {
  const { metrics, isLoading, isError = false, onRetry, labels } = props;

  const totalCompleted = metrics?.totalCompleted ?? 0;
  const domainMetrics = metrics?.domainMetrics ?? [];

  const items: KPIItem[] = [
    {
      id: "total-completed",
      label: labels.kpiTotalCompleted,
      value: totalCompleted,
    },
    ...domainMetrics.map((dm) => ({
      id: `domain-${dm.domain}`,
      label: dm.label || dm.domain || "",
      value:
        dm.averageScore !== null && dm.averageScore !== undefined
          ? labels.kpiDomainScore(Math.round(dm.averageScore))
          : labels.kpiEmptyScore,
    })),
  ];

  return {
    items,
    isLoading,
    isError: isError || (metrics === null && !isLoading),
    onRetry,
    retryButtonText: labels.retryButton,
    errorMessage: labels.errorMetricsMessage,
    loadingLabel: labels.loadingAriaLabel,
  };
}
