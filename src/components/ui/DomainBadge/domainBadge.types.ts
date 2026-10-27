export interface DomainBadgeProps {
  /** Nome do domínio, conforme o idioma; null não exibe o badge */
  label: string | null;
  /** Prefixo lido apenas pelo leitor de tela (ex.: "Domínio") */
  srPrefix?: string;
  className?: string;
}

export interface DomainBadgeViewModelReturn {
  isVisible: boolean;
  label: string;
  srPrefix?: string;
  className?: string;
}
