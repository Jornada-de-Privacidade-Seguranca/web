import type {
  CancelAssignmentModalProps,
  CancelAssignmentModalViewModelReturn,
} from "./cancelAssignmentModal.types";

export function useCancelAssignmentModalVM(
  props: CancelAssignmentModalProps
): CancelAssignmentModalViewModelReturn {
  const { isOpen, journeyTitle, isCancelling, labels, onKeep, onConfirm } =
    props;

  return {
    isOpen,
    title: labels.modalTitle,
    description: labels.modalDescription(journeyTitle),
    keepText: labels.keepButton,
    confirmText: labels.confirmButton,
    cancellingText: labels.cancellingButton,
    isCancelling,
    onKeep,
    onConfirm,
  };
}

