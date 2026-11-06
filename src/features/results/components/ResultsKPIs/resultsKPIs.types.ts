import type { ResultsMetrics, ResultsLabels } from "../../results.types";

export interface ResultsKPIsProps {
  metrics: ResultsMetrics | null;
  isLoading: boolean;
  isError?: boolean;
  onRetry?: () => void;
  labels: ResultsLabels;
}

export interface KPIItem {
  id: string;
  label: string;
  value: string | number;
}

export interface ResultsKPIsViewModelReturn {
  items: KPIItem[];
  isLoading: boolean;
  isError: boolean;
  onRetry?: () => void;
  retryButtonText: string;
  errorMessage: string;
  loadingLabel: string;
}
