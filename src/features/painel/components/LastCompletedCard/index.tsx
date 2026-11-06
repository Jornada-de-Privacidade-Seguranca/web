"use client";

import { CheckmarkCircle02Icon, ArrowRight01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Link } from "@/shared/i18n/navigation";
import { Button } from "@/components/ui";
import { useLastCompletedCardVM } from "./lastCompletedCard.viewmodel";
import type { LastCompletedCardProps } from "./lastCompletedCard.types";

export function LastCompletedCard(props: LastCompletedCardProps) {
  const {
    assessment,
    emptyMessage,
    sectionTitle,
    formattedDate,
    resultHref,
    allResultsHref,
    lastCompletionLabel,
    scoreLabel,
    viewResultText,
    viewAllResultsText,
  } = useLastCompletedCardVM(props);

  if (!assessment) {
    return (
      <article className="flex min-h-[280px] flex-col justify-between rounded-[2rem] border-2 border-dashed border-border/80 bg-card/50 p-6 shadow-sm backdrop-blur-sm">
        <div>
          <h3 className="font-heading text-lg font-bold tracking-tight text-foreground mb-4">
            {sectionTitle}
          </h3>
          <p className="text-sm font-medium text-muted-foreground">{emptyMessage}</p>
        </div>
        <div className="mt-8 border-t border-border/40 pt-4">
          <Button
            asChild
            variant="outline"
            className="h-11 w-full rounded-full border-border bg-background text-sm font-semibold text-foreground shadow-sm hover:bg-accent hover:text-accent-foreground"
          >
            <Link href={allResultsHref}>
              <span>{viewAllResultsText}</span>
              <HugeiconsIcon icon={ArrowRight01Icon} size={18} className="ml-2" />
            </Link>
          </Button>
        </div>
      </article>
    );
  }

  return (
    <article className="relative flex flex-col justify-between rounded-[2rem] border border-border bg-card/90 p-6 shadow-xl backdrop-blur-xl transition-all duration-200 hover:border-primary/30">
      <div>
        <div className="flex items-center justify-between gap-3">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 px-3 py-1 text-[0.68rem] font-bold uppercase tracking-[0.12em] text-emerald-600 ring-1 ring-emerald-500/20 dark:text-emerald-400">
            <HugeiconsIcon icon={CheckmarkCircle02Icon} size={14} />
            <span>{lastCompletionLabel}</span>
          </span>
          <time
            dateTime={assessment.completedAt}
            className="text-xs font-medium text-muted-foreground"
          >
            {formattedDate}
          </time>
        </div>

        <h3 className="mt-4 font-heading text-xl font-bold tracking-tight text-card-foreground">
          {assessment.title}
        </h3>

        <div className="mt-6 flex items-baseline gap-3 rounded-2xl border border-border/40 bg-muted/30 p-4">
          <div className="flex flex-col">
            <span className="text-[0.68rem] font-bold uppercase tracking-[0.12em] text-muted-foreground">
              {scoreLabel}
            </span>
            <div className="mt-1 flex items-baseline gap-1">
              <span className="text-3xl font-extrabold tracking-tight text-foreground">
                {assessment.score}
              </span>
              <span className="text-sm font-medium text-muted-foreground">/ 100</span>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 flex flex-col sm:flex-row items-center gap-3 border-t border-border/50 pt-4">
        <Button
          asChild
          variant="outline"
          className="h-11 w-full sm:flex-1 rounded-full border-border bg-background text-sm font-semibold text-foreground shadow-sm hover:bg-accent hover:text-accent-foreground"
        >
          <Link href={resultHref}>
            <span>{viewResultText}</span>
            <HugeiconsIcon icon={ArrowRight01Icon} size={18} className="ml-2" />
          </Link>
        </Button>
        <Button
          asChild
          variant="ghost"
          className="h-11 w-full sm:flex-1 rounded-full text-sm font-semibold text-muted-foreground hover:text-foreground"
        >
          <Link href={allResultsHref}>
            <span>{viewAllResultsText}</span>
          </Link>
        </Button>
      </div>
    </article>
  );
}
