import type { KeyboardEvent } from "react";
import type { CompetencyDifficulty } from "@features/competencies-questionnaire/competenciesQuestionnaire.types";

export interface CompetencyCardProps {
  id: number;
  name: string;
  description: string;
  difficulty: CompetencyDifficulty | null;
  /** Resposta atual: true = Sim, false = Não, null = sem resposta */
  answer: boolean | null;
  onAnswer: (acquired: boolean) => void;
  yesLabel: string;
  noLabel: string;
  difficultyPrefix: string;
  disabled?: boolean;
}

export interface CompetencyCardOption {
  value: boolean;
  label: string;
  isChecked: boolean;
  /** Roving tabindex: só a opção marcada (ou a primeira) entra no Tab */
  tabIndex: 0 | -1;
}

export interface CompetencyCardViewModelReturn {
  titleId: string;
  name: string;
  description: string;
  difficulty: CompetencyDifficulty | null;
  difficultyPrefix: string;
  options: CompetencyCardOption[];
  disabled: boolean;
  handleSelect: (value: boolean) => void;
  handleKeyDown: (event: KeyboardEvent<HTMLButtonElement>, value: boolean) => void;
}
