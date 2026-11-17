import type {
  CancelJourneyModalProps,
  CancelJourneyModalViewModelReturn,
} from "./cancelJourneyModal.types";

export function useCancelJourneyModalVM(
  props: CancelJourneyModalProps
): CancelJourneyModalViewModelReturn {
  const { isConfirming, onCancel, onConfirm } = props;

  return {
    isOpen: props.isOpen,
    title: props.title,
    description: props.description,
    keepLabel: props.keepLabel,
    confirmText: isConfirming ? props.confirmingLabel : props.confirmLabel,
    isConfirming,
    errorMessage: props.errorMessage,
    // Durante a chamada, nem o "Manter", nem o Esc, nem o clique fora fecham o modal
    onCancel: () => {
      if (!isConfirming) onCancel();
    },
    onConfirm: () => {
      if (!isConfirming) onConfirm();
    },
  };
}
