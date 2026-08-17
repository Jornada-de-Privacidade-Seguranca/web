import type { ResultsKPIsProps } from "./resultsKPIs.types";

export function useResultsKPIsVM(props: ResultsKPIsProps) {
  const { metrics, isLoading, labels } = props;

  const totalCompleted = metrics?.totalCompleted ?? 0;
  const averageScore = metrics?.averageScore ?? 0;

  return {
    totalCompleted,
    averageScore,
    isLoading,
    labelTotalCompleted: labels.kpiTotalCompleted,
    labelAverageScore: labels.kpiAverageScore,
  };
}
