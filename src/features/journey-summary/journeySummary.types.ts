import type React from "react";
import type { HugeiconsIcon } from "@hugeicons/react";
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

export type JourneyInstructionIcon = React.ComponentProps<typeof HugeiconsIcon>["icon"];

/** Card das instruções do questionário de competências exibidas no resumo. */
export interface JourneyInstructionItem {
  id: "objective" | "sincerity" | "navigation" | "estimatedTime";
  icon: JourneyInstructionIcon;
  title: string;
  description: string;
}

export interface JourneySummaryLabels {
  loadingTitle: string;
  subtitleStatic: string;
  backToJourneysText: string;
  backToJourneysAriaLabel: string;
  badgeLabel: string;
  /** Nome do domínio exibido na tag do cabeçalho; null quando não informado */
  domainLabel: string | null;
  lastScoreText: (score: number) => string;
  lastScoreAriaLabel: (score: number) => string;
  durationLabel: string;
  areasLabel: string;
  competenciesLabel: string;
  durationAriaLabel: (minutes: number) => string;
  areasAriaLabel: (count: number) => string;
  competenciesAriaLabel: (count: number) => string;
  estimatedMinutesText: (minutes: number) => string;
  howItWorksTitle: string;
  /** Texto de apresentação das instruções, já com o domínio da jornada aplicado */
  instructionsIntro: string;
  instructionsAriaLabel: string;
  instructionsTip: string;
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
  profileSelectionTitle: string;
  profileSelectionLockedWarning: string;
  profileSelectionCancel: string;
  profileSelectionConfirming: string;
}

/** Erros do perfil de jornada inicial devolvidos pela API, cada um com a sua mensagem. */
export type ProfileSelectionErrorType =
  | "selectionRequired"
  | "profileMismatch"
  | "selectionLocked"
  | "profileNotFound";

/** Diálogo que confirma o perfil de jornada inicial antes da primeira jornada. */
export interface ProfileSelectionDialogState {
  isOpen: boolean;
  isConfirming: boolean;
  /** Texto com o nome do perfil de jornada no idioma atual */
  description: string;
  /** Mensagem de falha ao salvar o perfil ou criar a jornada */
  error: string | null;
  /** "Confirmar e iniciar", ou "Tentar novamente" depois de uma falha geral */
  confirmLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
}

/** Aviso de que a primeira jornada precisa ser do perfil de jornada já escolhido. */
export interface InitialProfileNotice {
  message: string;
  linkLabel: string;
  href: string;
}

export interface JourneySummaryViewModelReturn {
  journey: JourneySummary | null;
  /** Nota (0 a 100) da última jornada concluída desse perfil; null se não houver */
  lastScore: number | null;
  /** Instruções do questionário, exibidas antes de iniciar a jornada */
  instructionItems: JourneyInstructionItem[];
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
  /** Confirmação do perfil de jornada inicial, aberta ao iniciar a primeira jornada */
  profileSelection: ProfileSelectionDialogState;
  /** Aviso no resumo de outro perfil quando o inicial já foi escolhido (null quando não se aplica) */
  initialProfileNotice: InitialProfileNotice | null;
  onStartJourney: () => void;
  onResumeCurrentJourney: () => void;
  onDismiss: () => void;
  labels: JourneySummaryLabels;
}

/** Resumo de uma jornada já criada ou de um perfil (antes de criar a jornada). */
export type JourneySummaryTarget = { journeyId: string } | { profileId: string };

export type JourneySummaryViewProps = JourneySummaryTarget;
