import type React from "react";
import type { HugeiconsIcon } from "@hugeicons/react";

export interface QuestionOption<T extends string = string> {
  id: T;
  label: string;
}

export interface SingleChoiceQuestionStepProps<T extends string = string> {
  /** Ícone exibido no badge ao lado do título da etapa */
  icon: React.ComponentProps<typeof HugeiconsIcon>["icon"];
  /** Título principal da etapa (ex: Nível de proficiência em inglês) */
  title: string;
  /** Texto explicativo de apoio */
  description?: string;
  /** Rótulo da pergunta exibido dentro do card */
  questionLabel: string;
  /** Lista de alternativas de resposta */
  options: QuestionOption<T>[];
  /** ID da opção atualmente selecionada */
  selectedOption: T | null;
  /** Callback ao selecionar uma opção */
  onSelectOption: (optionId: T) => void;
  /** Callback ao clicar em Continuar */
  onContinue: () => void;
  /** Callback ao clicar em Voltar (se fornecido) */
  onBack?: () => void;
  /** Callback ao clicar em Sair */
  onExit: () => void;
  /** Indica se está salvando/enviando */
  isSubmitting?: boolean;
  /** Mantém "Continuar" desabilitado mesmo com opção selecionada (ex: pergunta ainda indisponível) */
  isContinueDisabled?: boolean;
  /** Título da jornada exibido no cabeçalho */
  journeyTitle?: string;
  /** Tag do cabeçalho (ex: PRÉ-QUESTIONÁRIO · NÍVEL DE PROFICIÊNCIA EM INGLÊS) */
  stepTag?: string;
  /** Rótulo do botão de voltar */
  backLabel?: string;
  /** Aria-label do botão de voltar */
  backAriaLabel?: string;
  /** Rótulo do botão de continuar */
  continueLabel?: string;
  /** Rótulo do botão de continuar durante envio/salvamento */
  savingLabel?: string;
  /** Rótulo do botão de sair */
  exitLabel?: string;
  /** Aria-label do botão de sair */
  exitAriaLabel?: string;
}

export interface SingleChoiceQuestionStepViewModelReturn<T extends string = string>
  extends SingleChoiceQuestionStepProps<T> {
  canContinue: boolean;
}
