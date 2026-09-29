import type { JourneySummaryErrorType } from "@features/journey-summary/journeySummary.types";

export interface JourneySummaryErrorStateProps {
  variant: JourneySummaryErrorType;
  title: string;
  message: string;
  backHref: string;
  backLinkText: string;
}

export type JourneySummaryErrorStateViewModelReturn = JourneySummaryErrorStateProps;
