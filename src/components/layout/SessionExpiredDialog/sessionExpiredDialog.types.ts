export interface SessionExpiredDialogProps {
  /** Leva ao login; é a única forma de sair do aviso. */
  onConfirm: () => void;
}

export interface SessionExpiredDialogLabels {
  title: string;
  description: string;
  action: string;
}

export interface SessionExpiredDialogViewModelReturn {
  labels: SessionExpiredDialogLabels;
  onConfirm: () => void;
  /** Impede o fechamento pelo Esc: o aviso só sai pelo botão. */
  handleEscapeKeyDown: (event: KeyboardEvent) => void;
}
