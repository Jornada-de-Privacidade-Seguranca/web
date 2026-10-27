import type { CategoryScore } from "@features/journey-result/journeyResult.types";

export interface CategoryScoreListProps {
  categories: CategoryScore[];
  eyebrow: string;
  title: string;
}

export type CategoryScoreListViewModelReturn = CategoryScoreListProps;
