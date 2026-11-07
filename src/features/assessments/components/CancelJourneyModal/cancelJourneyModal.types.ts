export interface CancelJourneyModalProps {
  isOpen: boolean;
  title: string;
  description: string;
  keepLabel: string;
  confirmLabel: string;
  onCancel: () => void;
  onConfirm: () => void;
}

export interface CancelJourneyModalViewModelReturn {
  isOpen: boolean;
  title: string;
  description: string;
  keepLabel: string;
  confirmLabel: string;
  onCancel: () => void;
  onConfirm: () => void;
}

