"use client";

import { ScoreBar } from "@components/ui";
import { CollapsibleSection } from "@features/journey-result/components/CollapsibleSection";
import { useCategoryScoreListVM } from "./categoryScoreList.viewmodel";
import type { CategoryScoreListProps } from "./categoryScoreList.types";

/** Nota de cada categoria da pontuação ponderada, sem peso nem contribuição. */
export function CategoryScoreList(props: CategoryScoreListProps) {
  const { categories, eyebrow, title } = useCategoryScoreListVM(props);

  return (
    <CollapsibleSection eyebrow={eyebrow} title={title} testId="category-score-list">
      <ul className="space-y-5">
        {categories.map((category) => (
          <li
            key={category.id}
            className="grid items-center gap-2 md:grid-cols-[240px_1fr] md:gap-4"
          >
            <p className="text-sm font-medium text-foreground">{category.name}</p>
            <ScoreBar
              value={category.score.value}
              band={category.score.band}
              bandLabel={category.score.bandLabel}
              ariaLabel={category.scoreAriaLabel}
            />
          </li>
        ))}
      </ul>
    </CollapsibleSection>
  );
}

export * from "./categoryScoreList.types";
