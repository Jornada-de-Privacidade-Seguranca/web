import type { MetricsGridItem } from "@/components/ui/MetricsGrid/metricsGrid.types";
import type {
  AdminResultsSummaryProps,
  AdminResultsSummaryViewModelReturn,
} from "./adminResultsSummary.types";

const SKELETON_ITEMS: MetricsGridItem[] = [
  { id: "loading-completed", label: "", value: "" },
  { id: "loading-users", label: "", value: "" },
  { id: "loading-privacy", label: "", value: "" },
  { id: "loading-security", label: "", value: "" },
  { id: "loading-joint", label: "", value: "" },
];

export function useAdminResultsSummaryVM(
  props: AdminResultsSummaryProps
): AdminResultsSummaryViewModelReturn {
  const { summary, isLoading, labels } = props;

  if (isLoading) {
    return {
      items: SKELETON_ITEMS,
      isLoading: true,
      ariaLabel: labels.summaryAriaLabel,
      loadingLabel: labels.loadingAriaLabel,
    };
  }

  const items: MetricsGridItem[] = [
    {
      id: "total-completed",
      label: labels.summaryTotalCompleted,
      value: summary.totalCompletedJourneys,
    },
    {
      id: "total-users",
      label: labels.summaryTotalUsers,
      value: summary.totalEvaluatedUsers,
    },
    ...summary.domainAverages.map((domainAverage) => ({
      id: `domain-${domainAverage.domain}`,
      label: domainAverage.label,
      value:
        domainAverage.averageScore !== null
          ? labels.summaryDomainScore(domainAverage.averageScore)
          : labels.summaryEmptyScore,
    })),
  ];

  return {
    items,
    isLoading: false,
    ariaLabel: labels.summaryAriaLabel,
    loadingLabel: labels.loadingAriaLabel,
  };
}

