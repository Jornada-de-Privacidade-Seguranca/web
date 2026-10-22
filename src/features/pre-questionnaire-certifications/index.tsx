"use client";

import { Award01Icon } from "@hugeicons/core-free-icons";
import { MultiSelectSearchStep } from "@features/pre-questionnaire/components/MultiSelectSearchStep";
import { ExitConfirmationModal } from "@features/pre-questionnaire/components/ExitConfirmationModal";
import { JourneyNotFoundState } from "@features/pre-questionnaire/components/JourneyNotFoundState";
import { QuestionStepErrorBanner } from "@features/pre-questionnaire/components/QuestionStepErrorBanner";
import { QuestionStepSkeleton } from "@features/pre-questionnaire/components/QuestionStepSkeleton";
import { useCertificationsStepVM } from "./certificationsStep.viewmodel";

export function CertificationsStepView() {
  const {
    journeyTitle,
    groups,
    activeGroupId,
    visibleCertifications,
    selectedCertifications,
    searchTerm,
    maxSelectable,
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
    handleToggleCertification,
    handleRemoveCertification,
    handleContinue,
    handleBack,
    handleExit,
    handleCancelExit,
    handleConfirmExit,
    handleRetry,
  } = useCertificationsStepVM();

  if (isLoading) {
    return (
      <QuestionStepSkeleton
        loadingLabel={labels.loadingText}
        optionCount={5}
        testId="certifications-step-skeleton"
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
        icon={Award01Icon}
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
        items={visibleCertifications}
        selectedItems={selectedCertifications}
        onToggleItem={handleToggleCertification}
        onRemoveItem={handleRemoveCertification}
        removeItemAriaLabel={labels.removeCertificationAriaLabel}
        emptyLabel={labels.emptyLabel}
        counterLabel={labels.counterLabel}
        onContinue={handleContinue}
        onBack={handleBack}
        onExit={handleExit}
        isSubmitting={isSubmitting}
        isContinueDisabled={isContinueDisabled}
        maxSelectable={maxSelectable}
        limitReachedLabel={labels.limitReachedLabel}
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

export default CertificationsStepView;
export { useCertificationsStepVM } from "./certificationsStep.viewmodel";
export * from "./certificationsStep.types";
