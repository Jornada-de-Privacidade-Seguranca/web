import type { PendingAssessment } from "../../painel.types";

export interface CurrentJourneyCardProps {
  journey: PendingAssessment | null;
  sectionTitle: string;
  emptyMessage: string;
  exploreCtaText: string;
  continueCtaText: string;
  progressLabel: string;
  progressPercentLabel: string;
  badgeLabel: string;
  badgeVariant: "pending" | "in_progress";
}

export interface CurrentJourneyCardViewModelReturn {
  journey: PendingAssessment | null;
  sectionTitle: string;
  emptyMessage: string;
  exploreCtaText: string;
  continueCtaText: string;
  progressPercent: number;
  progressPercentText: string;
  progressAriaLabel: string;
  actionHref: string;
  badgeLabel: string;
  badgeVariant: "pending" | "in_progress";
}

