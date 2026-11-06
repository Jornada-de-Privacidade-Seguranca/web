"use client";

import {
  ArrowRight01Icon,
  CheckmarkCircle02Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Link } from "@/shared/i18n/navigation";
import { Button, DomainBadge } from "@/components/ui";
import { useResultCardVM } from "./resultCard.viewmodel";
import type { ResultCardProps } from "./resultCard.types";

export function ResultCard(props: ResultCardProps) {
  const {
    title,
    domainLabel,
    completedTagText,
    completedAtText,
    actionHref,
    buttonText,
    ctaAriaLabel,
    badgeAriaLabel,
  } = useResultCardVM(props);

  return (
    <article className="relative flex flex-col justify-between rounded-[2rem] border border-border bg-card/90 p-6 shadow-md backdrop-blur-xl transition-all duration-200 hover:border-primary/40 hover:shadow-lg">
      <div>
        <div className="flex flex-wrap items-center justify-between gap-2 min-h-[24px]">
          <DomainBadge label={domainLabel} />

          <span
            data-testid="result-score-tag"
            aria-label={badgeAriaLabel}
            className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-3 py-1 text-[0.68rem] font-bold uppercase tracking-[0.12em] text-emerald-600 dark:text-emerald-400 ring-1 ring-emerald-500/20"
          >
            <HugeiconsIcon icon={CheckmarkCircle02Icon} size={14} />
            <span>{completedTagText}</span>
          </span>
        </div>

        <h3 className="mt-3 font-heading text-lg font-bold tracking-tight text-card-foreground">
          {title}
        </h3>

        <div className="mt-2 text-xs font-medium text-muted-foreground">
          <span>{completedAtText}</span>
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

export * from "./resultCard.types";
