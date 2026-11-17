export interface AdminResultsErrorStateProps {
  /** Identifica a seção nos testes: lista, resumo ou opções dos filtros */
  testId: string;
  title: string;
  message: string;
  retryLabel: string;
  onRetry: () => void;
}

export type AdminResultsErrorStateViewModelReturn = AdminResultsErrorStateProps;
