"use client";

import { TranslateIcon } from "@hugeicons/core-free-icons";
import { SingleChoiceQuestionStep } from "@features/pre-questionnaire/components/SingleChoiceQuestionStep";
import { ExitConfirmationModal } from "@features/pre-questionnaire/components/ExitConfirmationModal";
import { QuestionStepErrorBanner } from "@features/pre-questionnaire/components/QuestionStepErrorBanner";
import { JourneyNotFoundState } from "@features/pre-questionnaire/components/JourneyNotFoundState";
import { QuestionStepSkeleton } from "@features/pre-questionnaire/components/QuestionStepSkeleton";
import { useEnglishStepVM } from "./englishStep.viewmodel";

export function EnglishStepView() {
  const {
    journeyTitle,
    selectedOption,
    isLoading,
    isNotFound,
    journeysHref,
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
  } = useEnglishStepVM();

  if (!isLoading && isNotFound) {
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
      {isLoading ? (
        <QuestionStepSkeleton
          loadingLabel={labels.loadingText}
          optionCount={options.length}
          testId="english-step-skeleton"
        />
      ) : (
        <>
          <SingleChoiceQuestionStep
            icon={TranslateIcon}
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

export default EnglishStepView;
export { useEnglishStepVM } from "./englishStep.viewmodel";
export * from "./englishStep.types";
