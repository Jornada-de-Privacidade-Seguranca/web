export interface StepHeaderProps {
  /** Rótulo da etapa em caixa alta (ex.: "QUESTIONÁRIO · COMPETÊNCIAS") */
  stepTag?: string;
  /** Nome do perfil da jornada em andamento */
  journeyTitle?: string;
  onExit: () => void;
  exitLabel?: string;
  exitAriaLabel?: string;
}

export type StepHeaderViewModelReturn = StepHeaderProps;
