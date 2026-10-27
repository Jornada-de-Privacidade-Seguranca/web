import type { DifficultyLevel } from "@shared/utils/difficultyLevel";

// ---- Contrato da API (/journeys/current/competencies) ----

export interface CompetencyNamedResponse {
  id: number;
  name_pt: string | null;
  name_en: string | null;
}

/** Área de conhecimento; a descrição ainda não é retornada pelo backend */
export interface CompetencyAreaResponse extends CompetencyNamedResponse {
  description_pt?: string | null;
  description_en?: string | null;
}

export interface CompetencyOptionResponse {
  id: number;
  origin_pt: string | null;
  origin_en: string | null;
  name_pt: string | null;
  name_en: string | null;
  description_pt: string | null;
  description_en: string | null;
  knowledge_domain: CompetencyNamedResponse | null;
  knowledge_area: CompetencyAreaResponse | null;
  difficulty: CompetencyNamedResponse | null;
}

export interface CompetencyAnswerResponse {
  id: number;
  acquired: boolean;
  type_acquired: number | null;
  competency: CompetencyOptionResponse;
}

export interface CompetencyStateResponse {
  journey_id: number;
  status: string;
  is_complete: boolean;
  competencies: CompetencyAnswerResponse[];
}

export interface CompetencyAnswerPayload {
  competency_id: number;
  acquired: boolean;
}

export interface SaveCompetenciesPayload {
  competencies: CompetencyAnswerPayload[];
}

export interface JourneyFinalizationResponse {
  journey_id: number;
  status: "completed";
  finished_at: string | null;
}

// ---- Modelo da tela ----

export interface CompetencyDifficulty {
  level: DifficultyLevel | null;
  label: string;
}

export interface CompetencyItem {
  id: number;
  name: string;
  description: string;
  difficulty: CompetencyDifficulty | null;
}

export interface CompetencyArea {
  /** id da área de conhecimento, ou "other" para competências sem área */
  id: string;
  name: string;
  /** Descrição conforme o idioma; null enquanto o backend não a retornar */
  description: string | null;
  competencies: CompetencyItem[];
}

/** Respostas acumuladas por competency_id (true = Sim, false = Não) */
export type CompetencyAnswers = Record<number, boolean>;

export interface CompetenciesQuestionnaireStoreState {
  /** Jornada a que as respostas pertencem; null antes de carregar as salvas */
  journeyId: string | null;
  answers: CompetencyAnswers;
  hydrate: (journeyId: string, answers: CompetencyAnswers) => void;
  setAnswer: (competencyId: number, acquired: boolean) => void;
  reset: () => void;
}

export interface CompetenciesQuestionnaireLabels {
  journeyLabel: string;
  areaIndicator: string;
  progressAriaLabel: string;
  areaDescriptionPlaceholder: string;
  instruction: string;
  areaCounter: string;
  yesLabel: string;
  noLabel: string;
  difficultyPrefix: string;
  emptyLabel: string;
  backLabel: string;
  backAriaLabel: string;
  nextLabel: string;
  savingLabel: string;
  exitLabel: string;
  exitAriaLabel: string;
  exitModal: {
    title: string;
    description: string;
    cancelButton: string;
    confirmButton: string;
  };
  loadingText: string;
  retryButton: string;
  summaryLink: string;
  noOngoingJourneyTitle: string;
  noOngoingJourneyMessage: string;
  backToJourneysLink: string;
  alreadyFinishedTitle: string;
  alreadyFinishedMessage: string;
  goToResultsLink: string;
}

export interface CompetenciesQuestionnaireViewModelReturn {
  journeyTitle: string;
  currentArea: CompetencyArea | null;
  /** Posição da área atual (base 0) e total de áreas */
  areaIndex: number;
  totalAreas: number;
  progressPercent: number;
  areaAnsweredCount: number;
  areaTotalCount: number;
  answers: CompetencyAnswers;
  isLastArea: boolean;
  isNextDisabled: boolean;
  isLoading: boolean;
  isSubmitting: boolean;
  error: string | null;
  /** Link exibido no banner de erro (ex.: resumo da jornada incompleta) */
  errorLink: { label: string; href: string } | null;
  /** Se o banner oferece nova tentativa */
  canRetry: boolean;
  isJourneyNotFound: boolean;
  isJourneyAlreadyFinished: boolean;
  isExitModalOpen: boolean;
  labels: CompetenciesQuestionnaireLabels;
  journeysHref: string;
  resultsHref: string;
  handleAnswer: (competencyId: number, acquired: boolean) => void;
  handleNext: () => void;
  handleBack: () => void;
  handleExit: () => void;
  handleCancelExit: () => void;
  handleConfirmExit: () => void;
  handleRetry: () => void;
}

export interface CompetenciesQuestionnaireViewProps {
  /** Parâmetro [areaIndex] da rota, ainda sem validação */
  areaIndexParam: string;
}
