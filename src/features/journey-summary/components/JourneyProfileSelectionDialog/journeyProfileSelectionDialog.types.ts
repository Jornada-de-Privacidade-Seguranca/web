export interface JourneyProfileSelectionDialogProps {
  isOpen: boolean;
  isConfirming: boolean;
  title: string;
  description: string;
  warning: string;
  error: string | null;
  cancelLabel: string;
  confirmLabel: string;
  confirmingLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export interface JourneyProfileSelectionDialogViewModelReturn
  extends Omit<JourneyProfileSelectionDialogProps, "onCancel"> {
  /** Fecha pelo "Cancelar" ou pelo Esc, exceto enquanto confirma */
  handleOpenChange: (open: boolean) => void;
}
