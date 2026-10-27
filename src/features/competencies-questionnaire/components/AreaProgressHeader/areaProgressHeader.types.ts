export interface AreaProgressHeaderProps {
  /** Texto "Área X / Y" */
  areaIndicator: string;
  /** Progresso geral do questionário (0 a 100) */
  progressPercent: number;
  progressAriaLabel: string;
  onExit: () => void;
  exitLabel: string;
  exitAriaLabel: string;
}

export interface AreaProgressHeaderViewModelReturn extends AreaProgressHeaderProps {
  /** Progresso limitado ao intervalo 0–100 */
  clampedPercent: number;
}
