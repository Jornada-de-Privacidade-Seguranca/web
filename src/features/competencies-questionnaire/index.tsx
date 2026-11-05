"use client";

import { useEffect, useRef } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowLeft01Icon, ArrowRight01Icon } from "@hugeicons/core-free-icons";
import { Button } from "@components/ui";
import { ExitConfirmationModal } from "@features/questionnaire/components/ExitConfirmationModal";
import { JourneyNotFoundState } from "@features/questionnaire/components/JourneyNotFoundState";
import { QuestionStepErrorBanner } from "@features/questionnaire/components/QuestionStepErrorBanner";
import { QuestionStepSkeleton } from "@features/questionnaire/components/QuestionStepSkeleton";
import { AreaProgressHeader } from "./components/AreaProgressHeader";
import { CompetencyCard } from "./components/CompetencyCard";
import { useCompetenciesQuestionnaireVM } from "./competenciesQuestionnaire.viewmodel";
import type { CompetenciesQuestionnaireViewProps } from "./competenciesQuestionnaire.types";

export function CompetenciesQuestionnaireView({ areaIndexParam }: CompetenciesQuestionnaireViewProps) {
  const {
    journeyTitle,
    currentArea,
    areaIndex,
    progressPercent,
    answers,
    isNextDisabled,
    isLoading,
    isSubmitting,
    error,
    errorLink,
    canRetry,
    isJourneyNotFound,
    isJourneyAlreadyFinished,
    isExitModalOpen,
    labels,
    journeysHref,
    resultsHref,
    handleAnswer,
    handleNext,
    handleBack,
    handleExit,
    handleCancelExit,
    handleConfirmExit,
    handleRetry,
  } = useCompetenciesQuestionnaireVM(areaIndexParam);

  // Ao trocar de área, o foco vai para o título da nova área
  const titleRef = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    if (!isLoading) titleRef.current?.focus();
  }, [areaIndex, isLoading]);

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

  if (isJourneyAlreadyFinished) {
    return (
      <JourneyNotFoundState
        title={labels.alreadyFinishedTitle}
        message={labels.alreadyFinishedMessage}
        backHref={resultsHref}
        backLinkText={labels.goToResultsLink}
      />
    );
  }

  if (isLoading) {
    return (
      <QuestionStepSkeleton
        loadingLabel={labels.loadingText}
        optionCount={4}
        testId="competencies-questionnaire-skeleton"
      />
    );
  }

  return (
    <>
      <div className="flex min-h-full w-full flex-col bg-background text-foreground">
        <AreaProgressHeader
          areaIndicator={labels.areaIndicator}
          progressPercent={progressPercent}
          progressAriaLabel={labels.progressAriaLabel}
          onExit={handleExit}
          exitLabel={labels.exitLabel}
          exitAriaLabel={labels.exitAriaLabel}
        />

        <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-4 py-10 md:py-12">
          {currentArea ? (
            <>
              {/* Cabeçalho da área */}
              <div className="mb-6">
                {journeyTitle && (
                  <p className="text-[0.68rem] font-bold uppercase tracking-[0.12em] text-muted-foreground">
                    {journeyTitle}
                  </p>
                )}
                <h1
                  ref={titleRef}
                  tabIndex={-1}
                  className="mt-2 font-heading text-2xl font-bold tracking-tight text-foreground outline-none md:text-3xl"
                >
                  {currentArea.name}
                </h1>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground md:text-base">
                  {currentArea.description ?? labels.areaDescriptionPlaceholder}
                </p>
                <p className="mt-3 text-sm leading-relaxed text-foreground/90">
                  {labels.instruction}
                </p>
                <p aria-live="polite" className="mt-2 text-xs text-muted-foreground">
                  {labels.areaCounter}
                </p>
              </div>

              <ul className="space-y-3">
                {currentArea.competencies.map((competency) => (
                  <li key={competency.id}>
                    <CompetencyCard
                      id={competency.id}
                      name={competency.name}
                      description={competency.description}
                      difficulty={competency.difficulty}
                      answer={answers[competency.id] ?? null}
                      onAnswer={(acquired) => handleAnswer(competency.id, acquired)}
                      yesLabel={labels.yesLabel}
                      noLabel={labels.noLabel}
                      difficultyPrefix={labels.difficultyPrefix}
                      disabled={isSubmitting}
                    />
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <p role="status" className="py-12 text-center text-sm text-muted-foreground">
              {labels.emptyLabel}
            </p>
          )}

          {/* Rodapé de navegação */}
          <footer className="mt-10 flex flex-wrap items-center justify-between gap-4">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={isSubmitting}
              aria-label={labels.backAriaLabel}
              className="gap-1.5"
            >
              <HugeiconsIcon icon={ArrowLeft01Icon} size={16} />
              <span>{labels.backLabel}</span>
            </Button>

            {/* aria-disabled mantém o botão focável enquanto a área não está completa */}
            <Button
              onClick={handleNext}
              aria-disabled={isNextDisabled}
              className="ml-auto gap-2 px-6 aria-disabled:cursor-not-allowed aria-disabled:opacity-50"
            >
              <span>{isSubmitting ? labels.savingLabel : labels.nextLabel}</span>
              <HugeiconsIcon icon={ArrowRight01Icon} size={18} />
            </Button>
          </footer>
        </div>
      </div>

      <QuestionStepErrorBanner
        message={error}
        retryLabel={canRetry ? labels.retryButton : undefined}
        onRetry={canRetry ? handleRetry : undefined}
        linkLabel={errorLink?.label}
        linkHref={errorLink?.href}
      />

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

export default CompetenciesQuestionnaireView;
export { useCompetenciesQuestionnaireVM } from "./competenciesQuestionnaire.viewmodel";
export * from "./competenciesQuestionnaire.types";
