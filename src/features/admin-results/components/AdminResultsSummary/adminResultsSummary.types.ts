import type { AdminResultsLabels, AdminResultsSummary } from "../../adminResults.types";
import type { MetricsGridItem } from "@/components/ui/MetricsGrid/metricsGrid.types";

export interface AdminResultsSummaryProps {
  summary: AdminResultsSummary;
  isLoading: boolean;
  labels: Pick<
    AdminResultsLabels,
    | "summaryAriaLabel"
    | "summaryTotalCompleted"
    | "summaryTotalUsers"
    | "summaryDomainScore"
    | "summaryEmptyScore"
    | "loadingAriaLabel"
  >;
}

export interface AdminResultsSummaryViewModelReturn {
  items: MetricsGridItem[];
  isLoading: boolean;
  ariaLabel: string;
  loadingLabel: string;
}

