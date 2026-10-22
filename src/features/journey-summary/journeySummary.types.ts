import type {
  JourneyStatus,
  JourneyProgress,
  JourneySummary,
  JourneySummaryErrorType,
} from "@services/journeySummaryService";

export type {
  JourneyStatus,
  JourneyProgress,
  JourneySummary,
  JourneySummaryErrorType,
};

export interface HowItWorksStep {
  title: string;
  description: string;
}

export interface JourneySummaryLabels {
  loadingTitle: string;
  subtitleStatic: string;
  backToJourneysText: string;
  backToJourneysAriaLabel: string;
  badgeLabel: string;
  stepsCountLabel: string;
  durationLabel: string;
  areasLabel: string;
  competenciesLabel: string;
  stepsCountAriaLabel: (count: number) => string;
  stepsProgressText: (completed: number, total: number) => string;
  stepsProgressAriaLabel: (completed: number, total: number) => string;
  durationAriaLabel: (minutes: number) => string;
  areasAriaLabel: (count: number) => string;
  competenciesAriaLabel: (count: number) => string;
  estimatedMinutesText: (minutes: number) => string;
  howItWorksTitle: string;
  howItWorksSubtitle: string;
  steps: HowItWorksStep[];
  footerNote: string;
  dismissLabel: string;
  dismissAriaLabel: string;
  notFoundTitle: string;
  notFoundMessage: string;
  serverErrorTitle: string;
  serverErrorMessage: string;
  backToJourneysLink: string;
  loadingAriaLabel: string;
}

export interface JourneySummaryViewModelReturn {
  journey: JourneySummary | null;
  isLoading: boolean;
  error: JourneySummaryErrorType | null;
  ctaLabel: string;
  ctaAriaLabel: string;
  resolvedStartUrl: string;
  onStartJourney: () => void;
  onDismiss: () => void;
  labels: JourneySummaryLabels;
}
