"use client";

import {
  ArrowRight01Icon,
  CheckmarkCircle02Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Link } from "@/shared/i18n/navigation";
import { Button, DomainBadge } from "@/components/ui";
import { useUserJourneysSectionVM } from "./userJourneysSection.viewmodel";
import type { UserJourneysSectionProps } from "./userJourneysSection.types";

export function UserJourneysSection(props: UserJourneysSectionProps) {
  const { journeys, allResultsHref, labels, hasJourneys } =
    useUserJourneysSectionVM(props);

  return (
    <section
      aria-labelledby="user-journeys-title"
      className="rounded-3xl border border-border/80 bg-card/90 p-6 shadow-md backdrop-blur-md space-y-6"
    >
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2
            id="user-journeys-title"
            className="font-heading text-lg font-bold text-foreground"
          >
            {labels.journeysTitle}
          </h2>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {labels.journeysSubtitle}
          </p>
        </div>

        {hasJourneys && (
          <Button
            asChild
            variant="outline"
            size="sm"
            className="rounded-full text-xs font-semibold shrink-0"
          >
            <Link href={allResultsHref}>
              <span>{labels.journeysViewAllResults}</span>
              <HugeiconsIcon
                icon={ArrowRight01Icon}
                size={14}
                className="ml-1.5"
              />
            </Link>
          </Button>
        )}
      </div>

      {!hasJourneys ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/80 p-8 text-center">
          <p className="text-sm font-semibold text-foreground">
            {labels.journeysEmptyTitle}
          </p>
          <p className="mt-1 text-xs text-muted-foreground max-w-sm">
            {labels.journeysEmptyDescription}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {journeys.map((j) => (
            <article
              key={j.id}
              className="flex flex-col justify-between rounded-2xl border border-border/70 bg-background/60 p-4 transition-all hover:border-primary/40 hover:shadow-sm"
            >
              <div>
                <div className="flex items-center justify-between gap-2">
                  <DomainBadge label={j.domainLabel} />
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 ring-1 ring-emerald-500/20">
                    <HugeiconsIcon icon={CheckmarkCircle02Icon} size={12} />
                    <span>{j.score}/100</span>
                  </span>
                </div>

                <h3 className="mt-2.5 font-heading text-sm font-bold text-foreground line-clamp-2">
                  {j.title}
                </h3>

                <p className="mt-1 text-[11px] text-muted-foreground">
                  {labels.journeysCompletedAt(
                    new Date(j.completedAt).toLocaleDateString()
                  )}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-border/40">
                <Button
                  asChild
                  variant="ghost"
                  size="sm"
                  className="w-full text-xs justify-between h-8 px-2 text-primary hover:text-primary hover:bg-primary/10"
                >
                  <Link href={`/jornada/${j.id}/resultado`}>
                    <span>{labels.journeysViewResult}</span>
                    <HugeiconsIcon icon={ArrowRight01Icon} size={14} />
                  </Link>
                </Button>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

export * from "./userJourneysSection.types";
