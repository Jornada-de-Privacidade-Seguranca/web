"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowLeft01Icon,
  ArrowRight01Icon,
  SparklesIcon,
} from "@hugeicons/core-free-icons";
import { Button } from "@components/ui";
import { ExitConfirmationModal } from "@features/questionnaire/components/ExitConfirmationModal";
import { JourneyNotFoundState } from "@features/questionnaire/components/JourneyNotFoundState";
import { StepHeader } from "@features/questionnaire/components/StepHeader";
import { useCompetenciesIntroVM } from "./competenciesIntro.viewmodel";

export function CompetenciesIntroView() {
  const {
    journeyTitle,
    labels,
    instructionItems,
    isLoading,
    isJourneyNotFound,
    isExitModalOpen,
    journeysHref,
    handleStart,
    handleBack,
    handleExit,
    handleCancelExit,
    handleConfirmExit,
  } = useCompetenciesIntroVM();

  if (isJourneyNotFound) {
    return (
      <JourneyNotFoundState
        title={labels.noOngoingJourneyTitle}
        message={labels.noOngoingJourneyMessage}
        backHref={journeysHref}
        backLinkText={labels.backToJourneysLink}
      />
    );
  }

  return (
    <>
      <div className="flex min-h-full w-full flex-col bg-background text-foreground">
        <StepHeader
          stepTag={labels.stepTag}
          journeyTitle={journeyTitle}
          onExit={handleExit}
          exitLabel={labels.exitLabel}
          exitAriaLabel={labels.exitAriaLabel}
        />

        <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col justify-center px-4 py-12">
          {/* Título com ícone */}
          <div className="mb-6 flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary/15 text-primary ring-1 ring-primary/25">
              <HugeiconsIcon icon={SparklesIcon} size={22} aria-hidden="true" />
            </div>
            <div>
              <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground md:text-3xl">
                {labels.title}
              </h1>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                {labels.subtitle}
              </p>
            </div>
          </div>

          <section
            aria-busy={isLoading}
            className="space-y-6 rounded-[2rem] border border-border bg-card/90 p-4 shadow-md backdrop-blur-xl md:p-6"
          >
            {isLoading && <span className="sr-only">{labels.loadingText}</span>}

            {/* Texto de apresentação, conforme o domínio da jornada */}
            {isLoading ? (
              <div
                aria-hidden="true"
                data-testid="competencies-intro-text-skeleton"
                className="animate-pulse space-y-2"
              >
                <div className="h-4 w-full rounded bg-muted" />
                <div className="h-4 w-full rounded bg-muted" />
                <div className="h-4 w-2/3 rounded bg-muted" />
              </div>
            ) : (
              <p className="text-sm leading-relaxed text-muted-foreground md:text-base">
                {labels.intro}
              </p>
            )}

            {/* Cards de instruções */}
            <ul
              aria-label={labels.instructionsAriaLabel}
              className="grid gap-3 sm:grid-cols-2"
            >
              {instructionItems.map((item) => (
                <li
                  key={item.id}
                  className="flex gap-3 rounded-2xl border border-border/60 bg-muted/20 p-4"
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <HugeiconsIcon
                      icon={item.icon}
                      size={18}
                      aria-hidden="true"
                    />
                  </span>
                  <div className="flex min-w-0 flex-1 flex-col gap-1">
                    <span className="text-sm font-medium text-foreground">
                      {item.title}
                    </span>
                    {item.isLoading ? (
                      <div
                        aria-hidden="true"
                        data-testid={`instruction-${item.id}-skeleton`}
                        className="animate-pulse space-y-1.5 pt-0.5"
                      >
                        <div className="h-3 w-full rounded bg-muted" />
                        <div className="h-3 w-3/4 rounded bg-muted" />
                      </div>
                    ) : (
                      <span className="text-xs leading-relaxed text-muted-foreground">
                        {item.description}
                      </span>
                    )}
                  </div>
                </li>
              ))}
            </ul>

            {/* Dica */}
            <aside className="rounded-2xl border border-primary/30 bg-primary/5 p-4 text-sm leading-relaxed text-foreground/90">
              {labels.tip}
            </aside>
          </section>

          {/* Rodapé de navegação */}
          <footer className="mt-8 flex flex-wrap items-center justify-between gap-4">
            <Button
              variant="outline"
              onClick={handleBack}
              aria-label={labels.backAriaLabel}
              className="gap-1.5"
            >
              <HugeiconsIcon icon={ArrowLeft01Icon} size={16} />
              <span>{labels.backLabel}</span>
            </Button>

            <Button onClick={handleStart} className="ml-auto gap-2 px-6">
              <span>{labels.startLabel}</span>
              <HugeiconsIcon icon={ArrowRight01Icon} size={18} />
            </Button>
          </footer>
        </div>
      </div>

      <ExitConfirmationModal
        isOpen={isExitModalOpen}
        title={labels.exitModal.title}
        description={labels.exitModal.description}
        cancelLabel={labels.exitModal.cancelButton}
        confirmLabel={labels.exitModal.confirmButton}
        onCancel={handleCancelExit}
        onConfirm={handleConfirmExit}
      />
    </>
  );
}

export default CompetenciesIntroView;
export { useCompetenciesIntroVM } from "./competenciesIntro.viewmodel";
export * from "./competenciesIntro.types";
