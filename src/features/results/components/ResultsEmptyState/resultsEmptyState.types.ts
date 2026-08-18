export type ResultsEmptyStateMode = "no-results" | "no-search-matches";

export interface ResultsEmptyStateProps {
  mode: ResultsEmptyStateMode;
  title: string;
  description: string;
  ctaText?: string;
  ctaHref?: string;
}
