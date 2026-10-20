"use client";

import { Briefcase01Icon } from "@hugeicons/core-free-icons";
import { SingleChoiceQuestionStep } from "@features/pre-questionnaire/components/SingleChoiceQuestionStep";
import { ExitConfirmationModal } from "@features/pre-questionnaire/components/ExitConfirmationModal";
import { JourneyNotFoundState } from "@features/pre-questionnaire/components/JourneyNotFoundState";
import { QuestionStepErrorBanner } from "@features/pre-questionnaire/components/QuestionStepErrorBanner";
import { QuestionStepSkeleton } from "@features/pre-questionnaire/components/QuestionStepSkeleton";
import { useExperienceStepVM } from "./experienceStep.viewmodel";
import type { ExperienceStepViewProps } from "./experienceStep.types";

export function ExperienceStepView({ journeyId }: ExperienceStepViewProps) {
  const {
    journeyTitle,
    questionLabel,
    selectedOption,
    isLoading,
    isSubmitting,
    isContinueDisabled,
    isNotFound,
    isExitModalOpen,
    error,
    options,
    labels,
    journeysHref,
    handleSelectOption,
    handleContinue,
    handleBack,
    handleExit,
    handleCancelExit,
    handleConfirmExit,
    handleRetry,
  } = useExperienceStepVM(journeyId);

  if (isLoading) {
    return (
      <QuestionStepSkeleton
        loadingLabel={labels.loadingText}
        optionCount={options.length}
        testId="experience-step-skeleton"
      />
    );
  }

  if (isNotFound) {
    return (
      <JourneyNotFoundState
        title={labels.notFoundTitle}
        message={labels.notFoundMessage}
        backHref={journeysHref}
        backLinkText={labels.backToJourneysLink}
      />
    );
  }

  return (
    <>
      <SingleChoiceQuestionStep
        icon={Briefcase01Icon}
        title={labels.title}
        description={labels.description}
        questionLabel={questionLabel}
        options={options}
        selectedOption={selectedOption}
        onSelectOption={handleSelectOption}
        onContinue={handleContinue}
        onBack={handleBack}
        onExit={handleExit}
        isSubmitting={isSubmitting}
        isContinueDisabled={isContinueDisabled}
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
  );
}

export default ExperienceStepView;
export { useExperienceStepVM } from "./experienceStep.viewmodel";
export * from "./experienceStep.types";
