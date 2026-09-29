"use client";

import { UserTime01Icon } from "@hugeicons/core-free-icons";
import { SingleChoiceQuestionStep } from "@features/pre-questionnaire/components/SingleChoiceQuestionStep";
import { ExitConfirmationModal } from "@features/pre-questionnaire/components/ExitConfirmationModal";
import { QuestionStepErrorBanner } from "@features/pre-questionnaire/components/QuestionStepErrorBanner";
import { QuestionStepSkeleton } from "@features/pre-questionnaire/components/QuestionStepSkeleton";
import { useRoleTenureStepVM } from "./roleTenureStep.viewmodel";
import type { RoleTenureStepViewProps } from "./roleTenureStep.types";

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
        <QuestionStepSkeleton
          loadingLabel={labels.loadingText}
          optionCount={options.length}
          testId="role-tenure-step-skeleton"
        />
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
            backAriaLabel={labels.backAriaLabel}
            continueLabel={labels.continueLabel}
            savingLabel={labels.savingLabel}
            exitLabel={labels.exitLabel}
            exitAriaLabel={labels.exitAriaLabel}
          />

          <QuestionStepErrorBanner
            message={error}
            retryLabel={labels.retryButton}
            onRetry={handleRetry}
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
      )}
    </>
  );
}

export default RoleTenureStepView;
export { useRoleTenureStepVM } from "./roleTenureStep.viewmodel";
export * from "./roleTenureStep.types";
