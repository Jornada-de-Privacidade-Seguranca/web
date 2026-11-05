import type {
  JourneyStatus,
  JourneySummary,
  JourneySummaryErrorType,
} from "@services/journeySummaryService";

export type {
  JourneyStatus,
  JourneySummary,
  JourneySummaryErrorType,
};

export interface HowItWorksStep {
  title: string;
  description: string;
}

export interface JourneySummaryLabels {
  loadingTitle: string;
  subtitleStatic: string;
  backToJourneysText: string;
  backToJourneysAriaLabel: string;
  badgeLabel: string;
  stepsCountLabel: string;
  durationLabel: string;
  areasLabel: string;
  competenciesLabel: string;
  stepsCountAriaLabel: (count: number) => string;
  stepsProgressText: (completed: number, total: number) => string;
  stepsProgressAriaLabel: (completed: number, total: number) => string;
  durationAriaLabel: (minutes: number) => string;
  areasAriaLabel: (count: number) => string;
  competenciesAriaLabel: (count: number) => string;
  estimatedMinutesText: (minutes: number) => string;
  howItWorksTitle: string;
  howItWorksSubtitle: string;
  steps: HowItWorksStep[];
  footerNote: string;
  dismissLabel: string;
  dismissAriaLabel: string;
  notFoundTitle: string;
  notFoundMessage: string;
  serverErrorTitle: string;
  serverErrorMessage: string;
  backToJourneysLink: string;
  loadingAriaLabel: string;
  /** Valor exibido nas caixas quando o dado não está disponível */
  notAvailable: string;
  notAvailableAriaLabel: (label: string) => string;
  startingLabel: string;
  startErrorMessage: string;
  resumeCurrentJourneyLabel: string;
}

export interface JourneySummaryViewModelReturn {
  journey: JourneySummary | null;
  isLoading: boolean;
  error: JourneySummaryErrorType | null;
  ctaLabel: string;
  ctaAriaLabel: string;
  /** Criando a jornada ou localizando a jornada em andamento */
  isStarting: boolean;
  /** Botão principal bloqueado (verificando a jornada atual, outra em andamento ou iniciando) */
  isCtaDisabled: boolean;
  /** Mensagem de falha ao iniciar/refazer a jornada */
  startError: string | null;
  /** Aviso de que o usuário já tem outra jornada em andamento (null quando não houver) */
  journeyInProgressNotice: string | null;
  onStartJourney: () => void;
  onResumeCurrentJourney: () => void;
  onDismiss: () => void;
  labels: JourneySummaryLabels;
}

/** Resumo de uma jornada já criada ou de um perfil (antes de criar a jornada). */
export type JourneySummaryTarget = { journeyId: string } | { profileId: string };

export type JourneySummaryViewProps = JourneySummaryTarget;
