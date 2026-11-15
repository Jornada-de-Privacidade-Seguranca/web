import type { MetricsGridItem } from "@/components/ui/MetricsGrid/metricsGrid.types";

/** Perfil da jornada como vem de GET /dashboard, com textos nos dois idiomas. */
export interface DashboardJourneyProfileApi {
  id: number;
  name_pt: string;
  name_en: string | null;
  description_pt: string | null;
  description_en: string | null;
}

/** Jornada como vem de GET /dashboard (em andamento, última concluída e recentes). */
export interface DashboardJourneyApi {
  id: number;
  status: string;
  started_at: string | null;
  finished_at: string | null;
  journey_profile: DashboardJourneyProfileApi | null;
}

/** Bloco `journeys` de GET /dashboard. */
export interface DashboardJourneysApi {
  has_unfinished_journey: boolean;
  unfinished_journey: DashboardJourneyApi | null;
  latest_journey: DashboardJourneyApi | null;
  recent_journeys: DashboardJourneyApi[];
}

/** Resposta de GET /dashboard (os demais blocos não são usados pelo painel). */
export interface DashboardApi {
  journeys: DashboardJourneysApi;
}

/** Item de GET /users/{user}/journeys, de onde vêm a nota e o progresso. */
export interface UserJourneyListItemApi {
  id: number;
  status: "ongoing" | "completed" | "cancelled";
  score: number | null;
  summary: {
    acquired_knowledges_count: number;
  } | null;
}

/** Resumo de GET /users/{user}/journeys/metrics (os demais campos não são usados). */
export interface JourneyMetricsApi {
  summary: {
    completed_journeys: number;
    ongoing_journeys: number;
    average_score: number | null;
  };
}

export type DashboardLocale = "pt" | "en";

/** "pending": jornada criada sem competências respondidas; "in_progress": já iniciada. */
export type PendingAssessmentStatus = "pending" | "in_progress";

export interface PendingAssessment {
  id: string;
  title: string;
  description: string;
  status: PendingAssessmentStatus;
  /** Competências do perfil; null quando o perfil não informa */
  totalQuestions: number | null;
  estimatedMinutes: number | null;
}

export interface LastCompletedAssessment {
  id: string;
  title: string;
  completedAt: string | null;
  /** Nota de 0 a 100; null quando a jornada não está na listagem do usuário */
  score: number | null;
}

export type HistoryItem = LastCompletedAssessment;

export interface DashboardMetrics {
  completedJourneys: number;
  pendingJourneys: number;
  averageScore: number;
}

export interface DashboardDataResponse {
  pending: PendingAssessment | null;
  lastCompleted: LastCompletedAssessment | null;
  history: HistoryItem[];
}

export interface QuickActionItem {
  id: string;
  label: string;
  description: string;
  href: string;
  iconName: "play" | "award" | "user";
}

export interface PainelLabels {
  pageTitle: string;
  welcomeGreeting: string;
  welcomeSubtitle: string;
  profileRoleFallback: string;
  organizationLabel: string;
  greetingSubtitle: string;
  quickActionsTitle: string;
  quickActionsSectionAriaLabel: string;
  quickActionContinueJourney: string;
  quickActionContinueJourneyDesc: string;
  quickActionStartJourney: string;
  quickActionStartJourneyDesc: string;
  quickActionViewResults: string;
  quickActionViewResultsDesc: string;
  quickActionViewProfile: string;
  quickActionViewProfileDesc: string;
  currentJourneySectionTitle: string;
  currentJourneySectionAriaLabel: string;
  currentJourneyEmpty: string;
  startFirstJourneyCta: string;
  startNewJourneyCta: string;
  continueJourneyCta: string;
  metricsSectionTitle: string;
  metricsSectionAriaLabel: string;
  metricsCompletedTitle: string;
  metricsCompletedSubtitle: string;
  metricsPendingTitle: string;
  metricsPendingSubtitle: string;
  metricsAverageScoreTitle: string;
  metricsAverageScoreSubtitle: string;
  pendingSectionTitle: string;
  completedSectionTitle: string;
  historySectionTitle: string;
  pendingEmpty: string;
  completedEmpty: string;
  historyEmpty: string;
  badgePending: string;
  badgeInProgress: string;
  startAssessment: string;
  continueAssessment: string;
  lastCompletionLabel: string;
  scoreLabel: string;
  viewResult: string;
  viewAllResults: string;
  defaultUserName: string;
  errorTitle: string;
  errorMessage: string;
  retryButton: string;
  loadingAriaLabel: string;
  pendingSectionAriaLabel: string;
  completedSectionAriaLabel: string;
  historySectionAriaLabel: string;
  accessDeniedTitle: string;
  accessDeniedMessage: string;
}

export interface PainelViewModelReturn {
  userFirstName: string;
  userRoleName: string;
  userOrganization: string | null;
  greetingTitle: string;
  greetingSubtitle: string;
  currentJourney: PendingAssessment | null;
  /** "{n} perguntas" e "{n} min" da jornada em andamento; null sem o dado */
  currentJourneyQuestionsText: string | null;
  currentJourneyTimeText: string | null;
  lastCompletedAssessment: LastCompletedAssessment | null;
  history: HistoryItem[];
  metricsItems: MetricsGridItem[];
  /** As métricas vêm de outra requisição: sem elas, só a seção de métricas some */
  hasMetrics: boolean;
  quickActions: QuickActionItem[];
  isLoading: boolean;
  error: string | null;
  /** Falso quando a nova tentativa não resolve (conta não ativada) */
  canRetry: boolean;
  accessDeniedMessage: string | null;
  handleDismissAccessDenied: () => void;
  handleRetry: () => void;
  labels: PainelLabels;
}
