import type {
  CancelJourneyModalProps,
  CancelJourneyModalViewModelReturn,
} from "./cancelJourneyModal.types";

export function useCancelJourneyModalVM(
  props: CancelJourneyModalProps
): CancelJourneyModalViewModelReturn {
  return {
    isOpen: props.isOpen,
    title: props.title,
    description: props.description,
    keepLabel: props.keepLabel,
    confirmLabel: props.confirmLabel,
    onCancel: props.onCancel,
    onConfirm: props.onConfirm,
  };
}

