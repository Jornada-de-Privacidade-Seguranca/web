"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowLeft01Icon,
  ArrowRight01Icon,
  Mortarboard01Icon,
} from "@hugeicons/core-free-icons";
import { Link } from "@/shared/i18n/navigation";
import { Button } from "@/components/ui";
import { PageShell } from "@/components/layout/PageShell";
import { useJourneySummaryVM } from "./journeySummary.viewmodel";
import { JourneySummarySkeleton } from "./components/JourneySummarySkeleton";
import { JourneyStatsGrid } from "./components/JourneyStatsGrid";
import { HowItWorksSection } from "./components/HowItWorksSection";
import { JourneySummaryErrorState } from "./components/JourneySummaryErrorState";

export interface JourneySummaryViewProps {
  journeyId: string;
}

export function JourneySummaryView({ journeyId }: JourneySummaryViewProps) {
  const {
    journey,
    isLoading,
    error,
    ctaLabel,
    ctaAriaLabel,
    onStartJourney,
    onDismiss,
    labels,
  } = useJourneySummaryVM(journeyId);

  const pageTitle = journey?.title ?? labels.loadingTitle;

  return (
    <PageShell title={pageTitle} subtitle={labels.subtitleStatic}>
      {error ? (
        <JourneySummaryErrorState
          variant={error}
          title={error === "not_found" ? labels.notFoundTitle : labels.serverErrorTitle}
          message={
            error === "not_found" ? labels.notFoundMessage : labels.serverErrorMessage
          }
          backHref="/jornadas"
          backLinkText={labels.backToJourneysLink}
        />
      ) : (
        <div className="mx-auto max-w-3xl space-y-6">
          <Link
            href="/jornadas"
            aria-label={labels.backToJourneysAriaLabel}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <HugeiconsIcon icon={ArrowLeft01Icon} size={16} />
            {labels.backToJourneysText}
          </Link>

          <div aria-busy={isLoading} data-testid="journey-summary-content">
            {isLoading ? (
              <JourneySummarySkeleton />
            ) : (
              journey && (
                <div className="space-y-6">
                  <section className="rounded-[2rem] border border-border bg-card/90 p-8 shadow-md backdrop-blur-xl">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/15 px-3 py-1 text-[0.68rem] font-bold uppercase tracking-[0.12em] text-primary ring-1 ring-primary/20">
                      <HugeiconsIcon icon={Mortarboard01Icon} size={14} />
                      {labels.badgeLabel}
                    </span>

                    <h1 className="mt-3 font-heading text-3xl font-bold tracking-tight text-card-foreground">
                      {journey.title}
                    </h1>

                    <div className="mt-6">
                      <JourneyStatsGrid journey={journey} labels={labels} />
                    </div>
                  </section>

                  <HowItWorksSection
                    title={labels.howItWorksTitle}
                    subtitle={labels.howItWorksSubtitle}
                    steps={labels.steps}
                  />
                </div>
              )
            )}
          </div>

          {!isLoading && journey && (
            <div className="flex flex-col items-center justify-between gap-4 rounded-2xl border border-border/60 bg-card/60 p-5 sm:flex-row">
              <p className="text-sm text-muted-foreground">{labels.footerNote}</p>
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  onClick={onDismiss}
                  aria-label={labels.dismissAriaLabel}
                >
                  {labels.dismissLabel}
                </Button>
                <Button onClick={onStartJourney} aria-label={ctaAriaLabel}>
                  <span>{ctaLabel}</span>
                  <HugeiconsIcon icon={ArrowRight01Icon} size={18} className="ml-2" />
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </PageShell>
  );
}

export default JourneySummaryView;
