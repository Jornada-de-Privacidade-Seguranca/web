import type { LastCompletedAssessment } from "../../painel.types";

export interface LastCompletedCardProps {
  assessment: LastCompletedAssessment | null;
  emptyMessage: string;
}

export interface LastCompletedCardViewModelReturn {
  assessment: LastCompletedAssessment | null;
  emptyMessage: string;
  formattedDate: string;
  resultHref: string;
  lastCompletionLabel: string;
  scoreLabel: string;
  viewResultText: string;
}
