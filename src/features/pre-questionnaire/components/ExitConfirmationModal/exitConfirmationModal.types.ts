export interface ExitConfirmationModalProps {
  isOpen: boolean;
  title: string;
  description: string;
  cancelLabel: string;
  confirmLabel: string;
  onCancel: () => void;
  onConfirm: () => void;
}

export type ExitConfirmationModalViewModelReturn = ExitConfirmationModalProps;
