export type JourneyStatus = "not_started" | "in_progress" | "completed";

export interface JourneyProgress {
  firstStepSlug: string;
  lastAnsweredStepSlug: string | null;
}

export interface JourneySummary {
  id: string;
  slug: string;
  title: string;
  questionsCount: number;
  estimatedMinutes: number;
  areasCount: number;
  competenciesCount: number;
  status: JourneyStatus;
  progress: JourneyProgress;
}

export type JourneySummaryErrorType = "not_found" | "server_error";

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
  questionsLabel: string;
  durationLabel: string;
  areasLabel: string;
  competenciesLabel: string;
  questionsAriaLabel: (count: number) => string;
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
