import type {
  Journey,
  AssessmentsLabels,
} from "../../assessments.types";

export interface JourneyCardProps {
  journey: Journey;
  labels: AssessmentsLabels;
}

export interface JourneyCardViewModelReturn {
  journey: Journey;
  isCompleted: boolean;
  isInProgress: boolean;
  isNotStarted: boolean;
  domainLabel: string;
  actionHref: string;
  buttonText: string;
  buttonVariant: "outline" | "default";
  badgeText: string;
  competenciesText: string | null;
  timeText: string | null;
  hasMeta: boolean;
  ctaAriaLabel: string;
}
