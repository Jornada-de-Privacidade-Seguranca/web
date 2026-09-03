import type {
  JourneySummary,
  JourneySummaryLabels,
} from "@features/journey-summary/journeySummary.types";

export interface JourneyStatsGridProps {
  journey: JourneySummary;
  labels: JourneySummaryLabels;
}

export interface JourneyStatItem {
  value: string;
  label: string;
  ariaLabel: string;
}

export interface JourneyStatsGridViewModelReturn {
  stats: JourneyStatItem[];
}
