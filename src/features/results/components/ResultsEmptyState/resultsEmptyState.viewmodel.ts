import type { ResultsEmptyStateProps } from "./resultsEmptyState.types";

export function useResultsEmptyStateVM(props: ResultsEmptyStateProps) {
  const { mode, title, description, ctaText, ctaHref } = props;

  const isNoResults = mode === "no-results";
  const hasCta = Boolean(isNoResults && ctaText && ctaHref);

  return {
    mode,
    title,
    description,
    ctaText,
    ctaHref: ctaHref || "/jornadas",
    isNoResults,
    hasCta,
  };
}
