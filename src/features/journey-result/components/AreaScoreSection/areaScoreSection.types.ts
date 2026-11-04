import type { AreaScore, AreaScoreGroup } from "@features/journey-result/journeyResult.types";

export interface AreaScoreSectionProps {
  groups: AreaScoreGroup[];
  /** Em jornadas conjuntas, cada domínio vira um bloco recolhível */
  isJointJourney: boolean;
  /** Nota mínima recomendada, posição do marcador das barras */
  recommendedScore: number;
  labels: {
    eyebrow: string;
    title: string;
    recommendation: string;
    markerAriaLabel: string;
  };
}

export interface AreaScoreCardsProps {
  areas: AreaScore[];
  recommendedScore: number;
  markerAriaLabel: string;
  /** Nível do heading de cada card, conforme a hierarquia da seção */
  headingLevel: 3 | 4;
}

export type AreaScoreSectionViewModelReturn = AreaScoreSectionProps;
