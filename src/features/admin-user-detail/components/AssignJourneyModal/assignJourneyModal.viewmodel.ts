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
    selectedProfileId,
    isSubmitting,
    errorMessage: errorMessage ?? null,
    canConfirm:
      selectedProfileId !== null && options.length > 0 && !isSubmitting,
    labels,
    onSelectProfile,
    onCancel,
    onConfirm,
  };
}

