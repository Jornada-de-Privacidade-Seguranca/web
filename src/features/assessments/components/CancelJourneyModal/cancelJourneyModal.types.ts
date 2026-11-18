export interface CancelJourneyModalProps {
  isOpen: boolean;
  title: string;
  description: string;
  keepLabel: string;
  confirmLabel: string;
  confirmingLabel: string;
  /** Cancelamento em andamento: os dois botões ficam desabilitados e o modal não fecha */
  isConfirming: boolean;
  errorMessage: string | null;
  onCancel: () => void;
  onConfirm: () => void;
}

export interface CancelJourneyModalViewModelReturn {
  isOpen: boolean;
  title: string;
  description: string;
  keepLabel: string;
  confirmText: string;
  isConfirming: boolean;
  errorMessage: string | null;
  onCancel: () => void;
  onConfirm: () => void;
}
