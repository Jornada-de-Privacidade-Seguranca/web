"use client";

import { Add01Icon, Cancel01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Button, DomainBadge, Message } from "@/components/ui";
import { useActiveJourneySectionVM } from "./activeJourneySection.viewmodel";
import type { ActiveJourneySectionProps } from "./activeJourneySection.types";

export function ActiveJourneySection(props: ActiveJourneySectionProps) {
  const {
    activeJourney,
    hasActiveJourney,
    isAssignDisabled,
    canAssignJourney,
    canCancelAssignment,
    domainLabel,
    formattedStartedAt,
    originText,
    journeySuccessMessage,
    labels,
    onAssignClick,
    onCancelAssignClick,
    onDismissSuccessMessage,
  } = useActiveJourneySectionVM(props);

  return (
    <section
      aria-labelledby="active-journey-title"
      className="rounded-3xl border border-border/80 bg-card/90 p-6 shadow-md backdrop-blur-md space-y-5"
    >
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2
            id="active-journey-title"
            className="font-heading text-lg font-bold text-foreground"
          >
            {labels.title}
          </h2>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {labels.subtitle}
          </p>
        </div>

        {canAssignJourney && (
          <div className="flex flex-col items-start sm:items-end gap-1.5 shrink-0">
            <Button
              type="button"
              size="sm"
              disabled={isAssignDisabled}
              onClick={onAssignClick}
              aria-describedby={
                isAssignDisabled ? "assign-journey-disabled-hint" : undefined
              }
              className="rounded-full text-xs font-semibold px-4"
            >
              <HugeiconsIcon icon={Add01Icon} size={14} className="mr-1.5" />
              <span>{labels.assignButton}</span>
            </Button>
            {isAssignDisabled && (
              <p
                id="assign-journey-disabled-hint"
                className="text-[11px] text-muted-foreground"
              >
                {labels.alreadyActiveHint}
              </p>
            )}
          </div>
        )}
      </div>

      {journeySuccessMessage && (
        <Message
          variant="success"
          title={journeySuccessMessage}
          onClose={onDismissSuccessMessage}
          closeLabel={labels.closeMessage}
        />
      )}

      {!hasActiveJourney || !activeJourney ? (
        <div
          data-testid="active-journey-empty"
          className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/80 p-8 text-center"
        >
          <p className="text-sm font-semibold text-foreground">
            {labels.emptyTitle}
          </p>
          <p className="mt-1 text-xs text-muted-foreground max-w-sm">
            {labels.emptyDescription}
          </p>
        </div>
      ) : (
        <article
          data-testid="active-journey-card"
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-border/70 bg-background/60 p-5"
        >
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <DomainBadge label={domainLabel} />
              <span className="text-xs font-medium text-muted-foreground">
                {originText}
              </span>
            </div>

            <h3 className="font-heading text-base font-bold text-foreground">
              {activeJourney.title}
            </h3>

            <p className="text-xs text-muted-foreground">
              {formattedStartedAt}
            </p>
          </div>

          {canCancelAssignment && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onCancelAssignClick}
              className="self-start sm:self-center rounded-full text-xs font-semibold border-destructive/40 text-destructive hover:bg-destructive/10 hover:text-destructive shrink-0"
            >
              <HugeiconsIcon icon={Cancel01Icon} size={14} className="mr-1.5" />
              <span>{labels.cancelButton}</span>
            </Button>
          )}
        </article>
      )}
    </section>
  );
}

export * from "./activeJourneySection.types";

