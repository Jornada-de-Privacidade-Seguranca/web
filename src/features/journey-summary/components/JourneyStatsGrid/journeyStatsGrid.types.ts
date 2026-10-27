import type {
  JourneySummary,
  JourneySummaryLabels,
} from "@features/journey-summary/journeySummary.types";

export interface JourneyStatsGridProps {
  journey: JourneySummary;
  labels: JourneySummaryLabels;
}

export type StatKey = "steps" | "duration" | "areas" | "competencies";

export interface JourneyStatItem {
  key: StatKey;
  value: string;
  label: string;
  ariaLabel: string;
}

export interface JourneyStatsGridViewModelReturn {
  stats: JourneyStatItem[];
}
