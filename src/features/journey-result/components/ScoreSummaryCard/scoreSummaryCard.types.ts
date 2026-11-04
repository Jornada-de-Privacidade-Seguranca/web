import type { ScoreValue } from "@features/journey-result/journeyResult.types";

export interface ScoreSummaryCardProps {
  journeyTitle: string;
  score: ScoreValue;
  overallLabel: string;
  scoreAriaLabel: string;
  declaredCountText: string;
  retakeHref: string;
  retakeLabel: string;
  backHref: string;
  backLabel: string;
}

export type ScoreSummaryCardViewModelReturn = ScoreSummaryCardProps;
