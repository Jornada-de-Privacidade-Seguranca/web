import type { DashboardMetrics } from "../../painel.types";

export interface MetricsGridProps {
  metrics: DashboardMetrics;
  sectionTitle: string;
  sectionAriaLabel: string;
  completedTitle: string;
  completedSubtitle: string;
  pendingTitle: string;
  pendingSubtitle: string;
  averageScoreTitle: string;
  averageScoreSubtitle: string;
}

export interface MetricCardItem {
  id: string;
  title: string;
  subtitle: string;
  value: string | number;
  suffix?: string;
  iconName: "completed" | "pending" | "score";
}

export interface MetricsGridViewModelReturn {
  sectionTitle: string;
  sectionAriaLabel: string;
  cards: MetricCardItem[];
}

