"use client";

import {
  CheckListIcon,
  ArrowRight01Icon,
  CheckmarkCircle02Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Link } from "@/shared/i18n/navigation";
import { Button } from "@/components/ui";
import { useResultCardVM } from "./resultCard.viewmodel";
import type { ResultCardProps } from "./resultCard.types";

export function ResultCard(props: ResultCardProps) {
  const {
    result,
    score,
    isHighScore,
    isMediumScore,
    actionHref,
    completedAtText,
    questionsText,
    buttonText,
    ctaAriaLabel,
  } = useResultCardVM(props);

  return (
    <article className="relative flex flex-col justify-between rounded-[2rem] border border-border bg-card/90 p-6 shadow-md backdrop-blur-xl transition-all duration-200 hover:border-primary/40 hover:shadow-lg">
      <div>
        <div className="flex items-center justify-between gap-3 min-h-[24px]">
          <h3 className="font-heading text-lg font-bold tracking-tight text-card-foreground">
            {result.title}
          </h3>

          {/* Badge de Nota Condicional */}
          <span
            data-testid="result-score-tag"
            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold shrink-0 ${
              isHighScore
                ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 ring-1 ring-emerald-500/20"
                : isMediumScore
                ? "bg-amber-500/15 text-amber-600 dark:text-amber-400 ring-1 ring-amber-500/20"
                : "bg-destructive/15 text-destructive ring-1 ring-destructive/20"
            }`}
          >
            <HugeiconsIcon icon={CheckmarkCircle02Icon} size={14} />
            <span>{score}</span>
          </span>
        </div>

        <p className="mt-2 text-sm leading-relaxed text-muted-foreground line-clamp-3">
          {result.description}
        </p>

        <div className="mt-6 flex flex-wrap items-center gap-4 text-xs font-medium text-muted-foreground">
          <span>{completedAtText}</span>
          <div className="flex items-center gap-1">
            <HugeiconsIcon
              icon={CheckListIcon}
              size={14}
              className="text-primary shrink-0"
            />
            <span>{questionsText}</span>
          </div>
        </div>
      </div>

      <div className="mt-8 border-t border-border/50 pt-4">
        <Button
          asChild
          variant="outline"
          className="h-11 w-full rounded-full border-border text-sm font-semibold transition-transform hover:bg-accent hover:text-accent-foreground active:scale-[0.99]"
        >
          <Link href={actionHref} aria-label={ctaAriaLabel}>
            <span>{buttonText}</span>
            <HugeiconsIcon
              icon={ArrowRight01Icon}
              size={18}
              className="ml-2 shrink-0"
            />
          </Link>
        </Button>
      </div>
    </article>
  );
}
