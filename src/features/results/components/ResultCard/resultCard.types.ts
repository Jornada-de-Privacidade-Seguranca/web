import type { ResultItem, ResultsLabels } from "../../results.types";

export interface ResultCardProps {
  result: ResultItem;
  labels: ResultsLabels;
}

export interface ResultCardViewModelReturn {
  title: string;
  domainLabel: string | null;
  completedTagText: string;
  completedAtText: string;
  actionHref: string;
  buttonText: string;
  ctaAriaLabel: string;
  badgeAriaLabel: string;
}
