import type { ResultsMetrics, ResultsLabels } from "../../results.types";

export interface ResultsKPIsProps {
  metrics: ResultsMetrics | null;
  isLoading: boolean;
  labels: ResultsLabels;
}
