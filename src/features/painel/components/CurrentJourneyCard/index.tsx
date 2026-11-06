"use client";

import {
  Compass01Icon,
  ArrowRight01Icon,
  Clock01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Link } from "@/shared/i18n/navigation";
import { Button } from "@/components/ui";
import { useCurrentJourneyCardVM } from "./currentJourneyCard.viewmodel";
import type { CurrentJourneyCardProps } from "./currentJourneyCard.types";

export function CurrentJourneyCard(props: CurrentJourneyCardProps) {
  const {
    journey,
    sectionTitle,
    emptyMessage,
    exploreCtaText,
    continueCtaText,
    progressPercent,
    progressPercentText,
    progressAriaLabel,
    actionHref,
    badgeLabel,
    badgeVariant,
  } = useCurrentJourneyCardVM(props);

  if (!journey) {
    return (
      <article className="flex min-h-[280px] flex-col justify-between rounded-[2rem] border-2 border-dashed border-border/80 bg-card/50 p-6 shadow-sm backdrop-blur-sm">
        <div>
          <h3 className="font-heading text-lg font-bold tracking-tight text-foreground mb-4">
            {sectionTitle}
          </h3>
          <p className="text-sm font-medium text-muted-foreground mb-4">
            {emptyMessage}
          </p>
        </div>
        <div className="mt-8 border-t border-border/40 pt-4">
          <Button
            asChild
            className="h-11 w-full rounded-full bg-primary text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90"
          >
            <Link href="/jornadas">
              <span>{exploreCtaText}</span>
              <HugeiconsIcon icon={ArrowRight01Icon} size={18} className="ml-2" />
            </Link>
          </Button>
        </div>
      </article>
    );
  }

  return (
    <article className="relative flex flex-col justify-between rounded-[2rem] border border-border/60 bg-card/90 p-6 shadow-sm backdrop-blur-md transition-all duration-200 hover:border-primary/40">
      <div>
        <div className="flex items-center justify-between gap-3">
          <span
            className={`inline-flex items-center rounded-full px-3 py-1 text-[0.68rem] font-bold uppercase tracking-[0.12em] ${
              badgeVariant === "pending"
                ? "bg-amber-500/15 text-amber-600 dark:text-amber-400 ring-1 ring-amber-500/20"
                : "bg-primary/15 text-primary ring-1 ring-primary/20"
            }`}
          >
            {badgeLabel}
          </span>

          <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
            <HugeiconsIcon icon={Clock01Icon} size={14} className="text-primary" />
            <span>{journey.estimatedMinutes} min</span>
          </div>
        </div>

        <h3 className="mt-4 font-heading text-xl font-bold tracking-tight text-card-foreground">
          {journey.title}
        </h3>

        <p className="mt-2 text-sm leading-relaxed text-muted-foreground line-clamp-2">
          {journey.description}
        </p>

        {/* Barra de Progresso Acessível */}
        <div className="mt-6 space-y-2">
          <div className="flex justify-between items-center text-xs font-semibold">
            <span className="text-muted-foreground flex items-center gap-1.5">
              <HugeiconsIcon icon={Compass01Icon} size={14} className="text-primary" />
              <span>Progresso</span>
            </span>
            <span className="text-foreground">{progressPercentText}</span>
          </div>

          <div
            role="progressbar"
            aria-valuenow={progressPercent}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={progressAriaLabel}
            className="h-2.5 w-full overflow-hidden rounded-full bg-muted"
          >
            <div
              className="h-full rounded-full bg-gradient-to-r from-primary to-blue-500 transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      <div className="mt-8 border-t border-border/50 pt-4">
        <Button
          asChild
          className="h-11 w-full rounded-full bg-primary text-sm font-semibold text-primary-foreground shadow-sm transition-transform hover:bg-primary/90 active:scale-[0.99]"
        >
          <Link href={actionHref}>
            <span>{continueCtaText}</span>
            <HugeiconsIcon icon={ArrowRight01Icon} size={18} className="ml-2" />
          </Link>
        </Button>
      </div>
    </article>
  );
}
