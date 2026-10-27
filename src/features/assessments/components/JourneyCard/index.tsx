"use client";

import {
  CheckListIcon,
  Clock01Icon,
  ArrowRight01Icon,
  CheckmarkCircle02Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Link } from "@/shared/i18n/navigation";
import { Button } from "@/components/ui";
import { useJourneyCardVM } from "./journeyCard.viewmodel";
import type { JourneyCardProps } from "./journeyCard.types";

export function JourneyCard(props: JourneyCardProps) {
  const {
    journey,
    isCompleted,
    isInProgress,
    actionHref,
    buttonText,
    buttonVariant,
    badgeText,
    questionsText,
    timeText,
    hasMeta,
    ctaAriaLabel,
  } = useJourneyCardVM(props);

  return (
    <article className="relative flex flex-col justify-between rounded-[2rem] border border-border bg-card/90 p-6 shadow-md backdrop-blur-xl transition-all duration-200 hover:border-primary/40 hover:shadow-lg">
      <div>
        <div className="flex items-center justify-between gap-3 min-h-[24px]">
          {isCompleted ? (
            <span
              data-testid="status-completed-tag"
              className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-3 py-1 text-[0.68rem] font-bold uppercase tracking-[0.12em] text-emerald-600 dark:text-emerald-400 ring-1 ring-emerald-500/20"
            >
              <HugeiconsIcon icon={CheckmarkCircle02Icon} size={14} />
              {badgeText}
            </span>
          ) : isInProgress ? (
            <span className="inline-flex items-center rounded-full bg-amber-500/15 px-3 py-1 text-[0.68rem] font-bold uppercase tracking-[0.12em] text-amber-600 dark:text-amber-400 ring-1 ring-amber-500/20">
              {badgeText}
            </span>
          ) : (
            <span className="inline-flex items-center rounded-full bg-muted px-3 py-1 text-[0.68rem] font-bold uppercase tracking-[0.12em] text-muted-foreground ring-1 ring-border">
              {badgeText}
            </span>
          )}
        </div>

        <h3 className="mt-3 font-heading text-lg font-bold tracking-tight text-card-foreground">
          {journey.title}
        </h3>

        <p className="mt-2 text-sm leading-relaxed text-muted-foreground line-clamp-3">
          {journey.description}
        </p>

        {hasMeta && (
          <div className="mt-6 flex flex-wrap items-center gap-4 text-xs font-medium text-muted-foreground">
            {questionsText && (
              <div className="flex items-center gap-1.5">
                <HugeiconsIcon
                  icon={CheckListIcon}
                  size={16}
                  className="text-primary shrink-0"
                />
                <span>{questionsText}</span>
              </div>
            )}
            {timeText && (
              <div className="flex items-center gap-1.5">
                <HugeiconsIcon
                  icon={Clock01Icon}
                  size={16}
                  className="text-primary shrink-0"
                />
                <span>{timeText}</span>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="mt-8 border-t border-border/50 pt-4">
        <Button
          asChild
          variant={buttonVariant}
          className={`h-11 w-full rounded-full text-sm font-semibold transition-transform active:scale-[0.99] ${
            buttonVariant === "default"
              ? "bg-primary text-primary-foreground shadow-md hover:bg-primary/90"
              : "border-border hover:bg-accent hover:text-accent-foreground"
          }`}
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
