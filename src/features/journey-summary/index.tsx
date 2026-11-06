"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import {
  AlertCircleIcon,
  ArrowLeft01Icon,
  ArrowRight01Icon,
  Mortarboard01Icon,
} from "@hugeicons/core-free-icons";
import { Link } from "@shared/i18n/navigation";
import { Button } from "@components/ui";
import { PageShell } from "@components/layout/PageShell";
import { useJourneySummaryVM } from "./journeySummary.viewmodel";
import type { JourneySummaryViewProps } from "./journeySummary.types";
import { JourneySummarySkeleton } from "./components/JourneySummarySkeleton";
import { JourneyStatsGrid } from "./components/JourneyStatsGrid";
import { JourneyInstructionsSection } from "./components/JourneyInstructionsSection";
import { JourneySummaryErrorState } from "./components/JourneySummaryErrorState";

export function JourneySummaryView(props: JourneySummaryViewProps) {
  const {
    journey,
    lastScore,
    instructionItems,
    isLoading,
    error,
    ctaLabel,
    ctaAriaLabel,
    isStarting,
    isCtaDisabled,
    startError,
    journeyInProgressNotice,
    onStartJourney,
    onResumeCurrentJourney,
    onDismiss,
    labels,
  } = useJourneySummaryVM(props);

  const pageTitle = error
    ? error === "not_found"
      ? labels.notFoundTitle
      : labels.serverErrorTitle
    : journey?.title ?? labels.loadingTitle;

  const pageSubtitle = error ? undefined : labels.subtitleStatic;

  return (
    <PageShell title={pageTitle} subtitle={pageSubtitle}>
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

          <div
            aria-busy={isLoading}
            aria-label={isLoading ? labels.loadingAriaLabel : undefined}
            role={isLoading ? "status" : undefined}
            data-testid="journey-summary-content"
          >
            {isLoading ? (
              <JourneySummarySkeleton />
            ) : (
              journey && (
                <div className="space-y-6">
                  <section className="rounded-[2rem] border border-border bg-card/90 p-8 shadow-md backdrop-blur-xl">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/15 px-3 py-1 text-[0.68rem] font-bold uppercase tracking-[0.12em] text-primary ring-1 ring-primary/20">
                        <HugeiconsIcon icon={Mortarboard01Icon} size={14} />
                        {labels.badgeLabel}
                      </span>
                      {labels.domainLabel && (
                        <span className="inline-flex items-center rounded-full border border-border/60 bg-muted/30 px-3 py-1 text-[0.68rem] font-bold uppercase tracking-[0.12em] text-muted-foreground">
                          {labels.domainLabel}
                        </span>
                      )}
                    </div>

                    <div className="mt-3 flex flex-wrap items-start justify-between gap-3">
                      <h2 className="font-heading text-3xl font-bold tracking-tight text-card-foreground">
                        {journey.title}
                      </h2>
                      {lastScore !== null && (
                        <span
                          aria-label={labels.lastScoreAriaLabel(lastScore)}
                          className="shrink-0 rounded-full border border-primary/30 bg-primary/5 px-3 py-1 text-xs font-medium tabular-nums text-foreground"
                        >
                          {labels.lastScoreText(lastScore)}
                        </span>
                      )}
                    </div>

                    <div className="mt-6">
                      <JourneyStatsGrid journey={journey} labels={labels} />
                    </div>
                  </section>

                  <JourneyInstructionsSection
                    title={labels.howItWorksTitle}
                    intro={labels.instructionsIntro}
                    items={instructionItems}
                    itemsAriaLabel={labels.instructionsAriaLabel}
                    tip={labels.instructionsTip}
                  />
                </div>
              )
            )}
          </div>

          {journeyInProgressNotice && (
            <div
              role="status"
              className="flex flex-col gap-3 rounded-2xl border border-warning/60 bg-warning/15 p-4 text-sm text-foreground sm:flex-row sm:items-center sm:justify-between"
            >
              <span className="flex items-start gap-2">
                <HugeiconsIcon
                  icon={AlertCircleIcon}
                  size={18}
                  aria-hidden="true"
                  className="mt-px shrink-0 text-warning"
                />
                {journeyInProgressNotice}
              </span>
              <Button
                variant="outline"
                onClick={onResumeCurrentJourney}
                disabled={isStarting}
                className="shrink-0"
              >
                {labels.resumeCurrentJourneyLabel}
              </Button>
            </div>
          )}

          {startError && (
            <div
              role="alert"
              className="rounded-2xl border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive"
            >
              {startError}
            </div>
          )}

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
                <Button
                  onClick={onStartJourney}
                  disabled={isCtaDisabled}
                  aria-label={ctaAriaLabel}
                >
                  <span>{isStarting ? labels.startingLabel : ctaLabel}</span>
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
