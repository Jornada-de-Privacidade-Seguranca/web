export interface SessionTimeoutWarningLabels {
  title: string;
  /** Tempo restante em mm:ss, atualizado a cada segundo; só visual. */
  countdown: string;
  /** Tempo restante em minutos, anunciado pelo leitor de tela a cada minuto. */
  announcement: string;
  hint: string;
  renew: string;
  logout: string;
  /** Mensagem de falha ao renovar; ausente quando não houve erro. */
  renewError?: string;
}

export interface SessionTimeoutWarningViewModelReturn {
  /** true quando faltam 5 minutos ou menos para o vencimento previsto da sessão. */
  isOpen: boolean;
  isRenewing: boolean;
  labels: SessionTimeoutWarningLabels;
  /** Chama GET /me; a resposta bem-sucedida renova a sessão e fecha o aviso. */
  handleRenew: () => Promise<void>;
  /** Encerra a sessão (POST /auth/logout); o layout leva ao login. */
  handleLogout: () => Promise<void>;
  /** Impede o fechamento pelo Esc: o aviso só sai por um dos botões. */
  handleEscapeKeyDown: (event: KeyboardEvent) => void;
}
