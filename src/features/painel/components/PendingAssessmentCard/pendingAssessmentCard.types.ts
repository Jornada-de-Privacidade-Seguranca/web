import type { PendingAssessment } from "../../painel.types";

export interface PendingAssessmentCardProps {
  assessment: PendingAssessment | null;
  emptyMessage: string;
}

export interface PendingAssessmentCardViewModelReturn {
  assessment: PendingAssessment | null;
  emptyMessage: string;
  badgeLabel: string;
  badgeVariant: "pending" | "in_progress";
  buttonText: string;
  actionHref: string;
  questionsText: string;
  timeText: string;
}
