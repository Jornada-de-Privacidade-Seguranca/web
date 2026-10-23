import type { DifficultyLevel } from "@shared/utils/difficultyLevel";

export interface DifficultyBadgeProps {
  /** Nível identificado; null usa a cor neutra */
  level: DifficultyLevel | null;
  /** Nome do nível, conforme o idioma */
  label: string;
  /** Prefixo lido apenas pelo leitor de tela (ex.: "Nível") */
  srPrefix?: string;
  className?: string;
}

export interface DifficultyBadgeViewModelReturn {
  label: string;
  srPrefix?: string;
  colorClassName: string;
  className?: string;
}
