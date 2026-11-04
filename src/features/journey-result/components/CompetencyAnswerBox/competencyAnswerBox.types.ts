import type { CompetencyAreaGroup } from "@features/journey-result/journeyResult.types";

export interface CompetencyAnswerBoxProps {
  /** "declared" para as marcadas como "Sim"; "undeclared" para "Não" ou sem resposta */
  variant: "declared" | "undeclared";
  title: string;
  eyebrow: string;
  groups: CompetencyAreaGroup[];
  labels: {
    emptyGroup: string;
    difficultyPrefix: string;
    domainPrefix: string;
  };
}

export interface CompetencyAnswerBoxViewModelReturn extends CompetencyAnswerBoxProps {
  isDeclared: boolean;
  isEmpty: boolean;
}
