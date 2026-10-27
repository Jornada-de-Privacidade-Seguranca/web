"use client";

import { Mortarboard02Icon } from "@hugeicons/core-free-icons";
import { MultiSelectSearchStep } from "@features/pre-questionnaire/components/MultiSelectSearchStep";
import { ExitConfirmationModal } from "@features/pre-questionnaire/components/ExitConfirmationModal";
import { JourneyNotFoundState } from "@features/pre-questionnaire/components/JourneyNotFoundState";
import { QuestionStepErrorBanner } from "@features/pre-questionnaire/components/QuestionStepErrorBanner";
import { QuestionStepSkeleton } from "@features/pre-questionnaire/components/QuestionStepSkeleton";
import { useAcademicStepVM } from "./academicStep.viewmodel";

export function AcademicStepView() {
  const {
    journeyTitle,
    groups,
    activeGroupId,
    visibleCourses,
    selectedCourses,
    searchTerm,
    isLoading,
    isSubmitting,
    isContinueDisabled,
    error,
    isJourneyNotFound,
    isExitModalOpen,
    labels,
    journeysHref,
    handleSearchChange,
    handleGroupChange,
    handleToggleCourse,
    handleRemoveCourse,
    handleContinue,
    handleBack,
    handleExit,
    handleCancelExit,
    handleConfirmExit,
    handleRetry,
  } = useAcademicStepVM();

  if (isLoading) {
    return (
      <QuestionStepSkeleton
        loadingLabel={labels.loadingText}
        optionCount={5}
        testId="academic-step-skeleton"
      />
    );
  }

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
      <MultiSelectSearchStep
        icon={Mortarboard02Icon}
        stepTag={labels.stepTag}
        journeyTitle={journeyTitle}
        title={labels.title}
        description={labels.description}
        searchTerm={searchTerm}
        onSearchChange={handleSearchChange}
        searchPlaceholder={labels.searchPlaceholder}
        searchAriaLabel={labels.searchAriaLabel}
        groups={groups}
        activeGroupId={activeGroupId}
        onGroupChange={handleGroupChange}
        groupsAriaLabel={labels.groupsAriaLabel}
        items={visibleCourses}
        selectedItems={selectedCourses}
        onToggleItem={handleToggleCourse}
        onRemoveItem={handleRemoveCourse}
        removeItemAriaLabel={labels.removeCourseAriaLabel}
        emptyLabel={labels.emptyLabel}
        counterLabel={labels.counterLabel}
        onContinue={handleContinue}
        onBack={handleBack}
        onExit={handleExit}
        isSubmitting={isSubmitting}
        isContinueDisabled={isContinueDisabled}
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

export default AcademicStepView;
export { useAcademicStepVM } from "./academicStep.viewmodel";
export * from "./academicStep.types";
