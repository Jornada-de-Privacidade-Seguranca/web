"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import { CancelCircleIcon, CheckmarkCircle02Icon } from "@hugeicons/core-free-icons";
import { DifficultyBadge, DomainBadge } from "@components/ui";
import { cn } from "@/shared/lib/utils";
import { CollapsibleSection } from "@features/journey-result/components/CollapsibleSection";
import { useCompetencyAnswerBoxVM } from "./competencyAnswerBox.viewmodel";
import type { CompetencyAnswerBoxProps } from "./competencyAnswerBox.types";

/**
 * Caixa de competências declaradas ou não declaradas, agrupadas por área. As
 * áreas iniciam recolhidas, para evitar listas longas na primeira visualização.
 */
export function CompetencyAnswerBox(props: CompetencyAnswerBoxProps) {
  const { variant, title, eyebrow, groups, labels, isDeclared, isEmpty } =
    useCompetencyAnswerBoxVM(props);

  return (
    <CollapsibleSection eyebrow={eyebrow} title={title} testId={`competency-box-${variant}`}>
      {isEmpty ? (
        <p className="text-sm text-muted-foreground">{labels.emptyGroup}</p>
      ) : (
        <div className="space-y-3">
          {groups.map((group) => (
            <CollapsibleSection
              key={group.id}
              title={`${group.name} · ${group.countText}`}
              headingLevel={3}
              variant="nested"
              defaultOpen={false}
            >
              <ul className="space-y-3">
                {group.competencies.map((competency) => (
                  <li
                    key={competency.id}
                    className="flex items-start gap-3 rounded-2xl border border-border/60 bg-card p-4"
                  >
                    <div
                      className={cn(
                        "grid h-8 w-8 shrink-0 place-items-center rounded-xl",
                        isDeclared
                          ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                          : "bg-destructive/15 text-destructive"
                      )}
                    >
                      <HugeiconsIcon
                        icon={isDeclared ? CheckmarkCircle02Icon : CancelCircleIcon}
                        size={16}
                        aria-hidden="true"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-foreground">{competency.name}</p>
                      {competency.description && (
                        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                          {competency.description}
                        </p>
                      )}
                      <div className="mt-3 flex flex-wrap gap-2">
                        {competency.difficulty && (
                          <DifficultyBadge
                            level={competency.difficulty.level}
                            label={competency.difficulty.label}
                            srPrefix={labels.difficultyPrefix}
                          />
                        )}
                        <DomainBadge label={competency.domain} srPrefix={labels.domainPrefix} />
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </CollapsibleSection>
          ))}
        </div>
      )}
    </CollapsibleSection>
  );
}

export * from "./competencyAnswerBox.types";
