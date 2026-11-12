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
    canConfirm: selectedProfileId !== null && !isSubmitting,
    labels,
    onSelectProfile,
    onCancel,
    onConfirm,
  };
}

