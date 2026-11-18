import type {
  AssignJourneyModalProps,
  AssignJourneyModalViewModelReturn,
} from "./assignJourneyModal.types";

export function useAssignJourneyModalVM(
  props: AssignJourneyModalProps
): AssignJourneyModalViewModelReturn {
  const {
    isOpen,
    options,
    isFirstJourney,
    isInitialProfileRequired,
    selectedProfileId,
    isSubmitting,
    errorMessage,
    labels,
    onSelectProfile,
    onCancel,
    onConfirm,
  } = props;

  return {
    isOpen,
    options,
    isFirstJourney,
    isInitialProfileRequired,
    selectedProfileId,
    isSubmitting,
    errorMessage: errorMessage ?? null,
    canConfirm:
      !isInitialProfileRequired &&
      selectedProfileId !== null &&
      options.length > 0 &&
      !isSubmitting,
    labels,
    onSelectProfile,
    onCancel,
    onConfirm,
  };
}

