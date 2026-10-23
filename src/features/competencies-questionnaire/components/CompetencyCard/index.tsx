"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import { Cancel01Icon, Tick02Icon } from "@hugeicons/core-free-icons";
import { DifficultyBadge } from "@components/ui/DifficultyBadge";
import { cn } from "@/shared/lib/utils";
import { useCompetencyCardVM } from "./competencyCard.viewmodel";
import type { CompetencyCardProps } from "./competencyCard.types";

export function CompetencyCard(props: CompetencyCardProps) {
  const {
    titleId,
    name,
    description,
    difficulty,
    difficultyPrefix,
    options,
    disabled,
    handleSelect,
    handleKeyDown,
  } = useCompetencyCardVM(props);

  return (
    <article className="rounded-2xl border border-border/60 bg-card/90 p-5 shadow-sm md:p-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h2
              id={titleId}
              className="font-heading text-base font-semibold text-foreground md:text-lg"
            >
              {name}
            </h2>
            {difficulty && (
              <DifficultyBadge
                level={difficulty.level}
                label={difficulty.label}
                srPrefix={difficultyPrefix}
              />
            )}
          </div>
          {description && (
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{description}</p>
          )}
        </div>

        <div role="radiogroup" aria-labelledby={titleId} className="flex shrink-0 gap-2 md:pt-1">
          {options.map((option) => (
            <button
              key={String(option.value)}
              type="button"
              role="radio"
              aria-checked={option.isChecked}
              tabIndex={option.tabIndex}
              data-value={String(option.value)}
              disabled={disabled}
              onClick={() => handleSelect(option.value)}
              onKeyDown={(event) => handleKeyDown(event, option.value)}
              className={cn(
                "inline-flex cursor-pointer items-center gap-1.5 rounded-xl border px-4 py-2 text-sm font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary disabled:cursor-not-allowed disabled:opacity-60",
                option.value
                  ? option.isChecked
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border/60 bg-muted/20 text-muted-foreground hover:border-primary/50 hover:text-foreground"
                  : option.isChecked
                    ? "border-destructive bg-destructive/15 text-destructive"
                    : "border-border/60 bg-muted/20 text-muted-foreground hover:border-destructive/50 hover:text-foreground"
              )}
            >
              <HugeiconsIcon
                icon={option.value ? Tick02Icon : Cancel01Icon}
                size={16}
                aria-hidden="true"
              />
              <span>{option.label}</span>
            </button>
          ))}
        </div>
      </div>
    </article>
  );
}

export * from "./competencyCard.types";
