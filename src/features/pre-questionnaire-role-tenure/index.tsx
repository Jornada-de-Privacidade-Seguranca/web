"use client";

import { UserTime01Icon } from "@hugeicons/core-free-icons";
import { SingleChoiceQuestionStep } from "@features/pre-questionnaire/components/SingleChoiceQuestionStep";
import { ExitConfirmationModal } from "@features/pre-questionnaire/components/ExitConfirmationModal";
import { useRoleTenureStepVM } from "./roleTenureStep.viewmodel";

export interface RoleTenureStepViewProps {
  journeySlug: string;
}

export function RoleTenureStepView({ journeySlug }: RoleTenureStepViewProps) {
  const {
    journeyTitle,
    selectedOption,
    isLoading,
    isSubmitting,
    isExitModalOpen,
    error,
    options,
    labels,
    handleSelectOption,
    handleContinue,
    handleBack,
    handleExit,
    handleCancelExit,
    handleConfirmExit,
    handleRetry,
  } = useRoleTenureStepVM(journeySlug);

  return (
    <>
      {isLoading ? (
        <div
          role="status"
          aria-busy="true"
          aria-label={labels.loadingText}
          data-testid="role-tenure-step-skeleton"
          className="flex min-h-screen w-full flex-col bg-background"
        >
          <header className="h-16 border-b border-border/40 bg-background/50 animate-pulse" />
          <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col justify-center px-4 pt-24 pb-12 animate-pulse space-y-6">
            <div className="flex items-center gap-3">
              <div className="h-11 w-11 rounded-2xl bg-muted" />
              <div className="h-8 w-64 rounded-lg bg-muted" />
            </div>
            <div className="rounded-[2rem] border border-border/40 bg-card/60 p-8 space-y-4">
              <div className="h-6 w-48 rounded bg-muted" />
              <div className="h-4 w-96 max-w-full rounded bg-muted/60" />
              <div className="space-y-3 pt-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="h-14 rounded-2xl bg-muted/40" />
                ))}
              </div>
            </div>
          </main>
        </div>
      ) : (
        <>
          <SingleChoiceQuestionStep
            icon={UserTime01Icon}
            title={labels.title}
            description={labels.description}
            questionLabel={labels.questionLabel}
            options={options}
            selectedOption={selectedOption}
            onSelectOption={handleSelectOption}
            onContinue={handleContinue}
            onBack={handleBack}
            onExit={handleExit}
            isSubmitting={isSubmitting}
            journeyTitle={journeyTitle}
            stepTag={labels.stepTag}
            backLabel={labels.backLabel}
            continueLabel={labels.continueLabel}
            exitLabel={labels.exitLabel}
            exitAriaLabel={labels.exitAriaLabel}
          />

          {error && (
            <div
              role="alert"
              className="fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-2xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive shadow-lg backdrop-blur"
            >
              <span>{error}</span>
              <button
                type="button"
                onClick={handleRetry}
                className="font-bold underline cursor-pointer"
              >
                {labels.retryButton}
              </button>
            </div>
          )}

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
      )}
    </>
  );
}

export default RoleTenureStepView;
export { useRoleTenureStepVM } from "./roleTenureStep.viewmodel";
export * from "./roleTenureStep.types";
