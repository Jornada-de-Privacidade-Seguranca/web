"use client";

import { ScoreBar } from "@components/ui";
import { CollapsibleSection } from "@features/journey-result/components/CollapsibleSection";
import { useAreaScoreSectionVM } from "./areaScoreSection.viewmodel";
import type { AreaScoreCardsProps, AreaScoreSectionProps } from "./areaScoreSection.types";

function AreaScoreCards({ areas, recommendedScore, markerAriaLabel, headingLevel }: AreaScoreCardsProps) {
  const Heading = `h${headingLevel}` as const;

  return (
    <ul className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {areas.map((area) => (
        <li
          key={area.id}
          data-testid="area-score-card"
          className="flex flex-col rounded-2xl border border-border/60 bg-muted/20 p-5"
        >
          <Heading className="mb-4 text-sm font-semibold text-foreground">{area.name}</Heading>
          <ScoreBar
            value={area.score.value}
            band={area.score.band}
            bandLabel={area.score.bandLabel}
            ariaLabel={area.scoreAriaLabel}
            marker={{ value: recommendedScore, ariaLabel: markerAriaLabel }}
            className="mt-auto"
          />
          <p className="mt-3 text-xs text-muted-foreground">{area.countText}</p>
        </li>
      ))}
    </ul>
  );
}

/** Conhecimentos adquiridos por área, com o mínimo recomendado em cada barra. */
export function AreaScoreSection(props: AreaScoreSectionProps) {
  const { groups, isJointJourney, recommendedScore, labels } = useAreaScoreSectionVM(props);

  return (
    <CollapsibleSection eyebrow={labels.eyebrow} title={labels.title} testId="area-score-section">
      <p className="mb-6 text-sm text-muted-foreground">{labels.recommendation}</p>
      {isJointJourney ? (
        <div className="space-y-4">
          {groups.map((group) => (
            <CollapsibleSection
              key={group.id}
              title={group.title ?? ""}
              headingLevel={3}
              variant="nested"
            >
              <AreaScoreCards
                areas={group.areas}
                recommendedScore={recommendedScore}
                markerAriaLabel={labels.markerAriaLabel}
                headingLevel={4}
              />
            </CollapsibleSection>
          ))}
        </div>
      ) : (
        groups.map((group) => (
          <AreaScoreCards
            key={group.id}
            areas={group.areas}
            recommendedScore={recommendedScore}
            markerAriaLabel={labels.markerAriaLabel}
            headingLevel={3}
          />
        ))
      )}
    </CollapsibleSection>
  );
}

export * from "./areaScoreSection.types";
