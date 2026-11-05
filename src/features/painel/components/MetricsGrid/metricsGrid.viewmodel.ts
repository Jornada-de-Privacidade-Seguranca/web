import type {
  MetricsGridProps,
  MetricsGridViewModelReturn,
  MetricCardItem,
} from "./metricsGrid.types";

export function useMetricsGridVM(
  props: MetricsGridProps
): MetricsGridViewModelReturn {
  const cards: MetricCardItem[] = [
    {
      id: "completed",
      title: props.completedTitle,
      subtitle: props.completedSubtitle,
      value: props.metrics.completedJourneys,
      iconName: "completed",
    },
    {
      id: "pending",
      title: props.pendingTitle,
      subtitle: props.pendingSubtitle,
      value: props.metrics.pendingJourneys,
      iconName: "pending",
    },
    {
      id: "averageScore",
      title: props.averageScoreTitle,
      subtitle: props.averageScoreSubtitle,
      value: props.metrics.averageScore,
      suffix: "/ 100",
      iconName: "score",
    },
  ];

  return {
    sectionTitle: props.sectionTitle,
    sectionAriaLabel: props.sectionAriaLabel,
    cards,
  };
}

