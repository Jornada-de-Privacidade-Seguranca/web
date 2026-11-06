"use client";

import {
  CheckListIcon,
  Clock01Icon,
  ArrowRight01Icon,
  Cancel01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Link } from "@/shared/i18n/navigation";
import { Button, DomainBadge } from "@/components/ui";
import { usePendingJourneyCardVM } from "./pendingJourneyCard.viewmodel";
import type { PendingJourneyCardProps } from "./pendingJourneyCard.types";

export function PendingJourneyCard(props: PendingJourneyCardProps) {
  const {
    journey,
    domainLabel,
    badgeText,
    badgeVariant,
    buttonText,
    actionHref,
    canCancel,
    cancelButtonText,
    competenciesText,
    timeText,
    onCancelJourney,
  } = usePendingJourneyCardVM(props);

  return (
    <article className="relative flex flex-col justify-between overflow-hidden rounded-[2rem] border border-border/80 bg-gradient-to-br from-card via-card to-primary/5 p-6 md:p-8 shadow-lg backdrop-blur-xl transition-all duration-200 hover:border-primary/40">
      <div>
        <div className="flex flex-wrap items-center justify-between gap-3 min-h-[28px]">
          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold uppercase tracking-[0.12em] ${
                badgeVariant === "assigned"
                  ? "bg-purple-500/15 text-purple-600 dark:text-purple-400 ring-1 ring-purple-500/20"
                  : "bg-amber-500/15 text-amber-600 dark:text-amber-400 ring-1 ring-amber-500/20"
              }`}
            >
              {badgeText}
            </span>

            <DomainBadge label={domainLabel} />
          </div>

          {timeText && (
            <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
              <HugeiconsIcon icon={Clock01Icon} size={16} className="text-primary" />
              <span>{timeText}</span>
            </div>
          )}
        </div>

        <h3 className="mt-4 font-heading text-xl md:text-2xl font-bold tracking-tight text-card-foreground">
          {journey.title}
        </h3>

        <p className="mt-2 text-sm md:text-base leading-relaxed text-muted-foreground">
          {journey.description}
        </p>

        {competenciesText && (
          <div className="mt-6 flex items-center gap-2 text-xs font-medium text-muted-foreground">
            <HugeiconsIcon icon={CheckListIcon} size={16} className="text-primary" />
            <span>{competenciesText}</span>
          </div>
        )}
      </div>

      <div className="mt-8 flex flex-col-reverse sm:flex-row items-center justify-end gap-3 border-t border-border/50 pt-5">
        {canCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancelJourney}
            className="w-full sm:w-auto h-11 rounded-full border-border/80 text-sm font-semibold text-muted-foreground hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30"
          >
            <HugeiconsIcon icon={Cancel01Icon} size={16} className="mr-1.5" />
            {cancelButtonText}
          </Button>
        )}

        <Button
          asChild
          className="w-full sm:w-auto h-11 rounded-full bg-primary px-6 text-sm font-semibold text-primary-foreground shadow-md transition-transform hover:bg-primary/90 active:scale-[0.99]"
        >
          <Link href={actionHref}>
            <span>{buttonText}</span>
            <HugeiconsIcon icon={ArrowRight01Icon} size={18} className="ml-2" />
          </Link>
        </Button>
      </div>
    </article>
  );
}

