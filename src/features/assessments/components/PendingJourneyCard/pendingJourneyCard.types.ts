import type { Journey, AssessmentsLabels } from "../../assessments.types";

export interface PendingJourneyCardProps {
  journey: Journey;
  labels: AssessmentsLabels;
  onCancelJourney?: () => void;
}

export interface PendingJourneyCardViewModelReturn {
  journey: Journey;
  domainLabel: string;
  badgeText: string;
  badgeVariant: "in_progress" | "assigned";
  buttonText: string;
  actionHref: string;
  canCancel: boolean;
  cancelButtonText: string;
  competenciesText: string | null;
  timeText: string | null;
  onCancelJourney?: () => void;
}

