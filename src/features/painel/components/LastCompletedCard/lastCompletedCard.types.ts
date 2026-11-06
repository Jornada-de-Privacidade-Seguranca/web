import type { LastCompletedAssessment } from "../../painel.types";

export interface LastCompletedCardProps {
  assessment: LastCompletedAssessment | null;
  emptyMessage: string;
  sectionTitle?: string;
  viewAllResultsText?: string;
}

export interface LastCompletedCardViewModelReturn {
  assessment: LastCompletedAssessment | null;
  emptyMessage: string;
  sectionTitle: string;
  formattedDate: string;
  resultHref: string;
  allResultsHref: string;
  lastCompletionLabel: string;
  scoreLabel: string;
  viewResultText: string;
  viewAllResultsText: string;
}
