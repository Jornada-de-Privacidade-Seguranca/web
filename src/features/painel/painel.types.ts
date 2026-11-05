export type PendingAssessmentStatus = "pending" | "in_progress";

export interface PendingAssessment {
  id: string;
  title: string;
  description: string;
  status: PendingAssessmentStatus;
  totalQuestions: number;
  estimatedMinutes: number;
  currentStep?: string;
  progressPercent?: number;
  knowledgeDomain?: "privacy" | "security" | "joint" | null;
}

export interface LastCompletedAssessment {
  id: string;
  title: string;
  completedAt: string;
  score: number;
}

export interface HistoryItem {
  id: string;
  title: string;
  completedAt: string;
  score: number;
}

export interface DashboardMetrics {
  completedJourneys: number;
  pendingJourneys: number;
  averageScore: number;
}

export interface DashboardDataResponse {
  pending: PendingAssessment | null;
  lastCompleted: LastCompletedAssessment | null;
  history: HistoryItem[];
  metrics: DashboardMetrics;
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
  startNewJourneyCta: string;
  continueJourneyCta: string;
  progressLabel: string;
  progressPercentLabel: string;
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
  errorTitle: string;
  errorMessage: string;
  retryButton: string;
  loadingAriaLabel: string;
  pendingSectionAriaLabel: string;
  completedSectionAriaLabel: string;
  historySectionAriaLabel: string;
}

export interface PainelViewModelReturn {
  userFirstName: string;
  userRoleName: string;
  userOrganization: string | null;
  greetingTitle: string;
  greetingSubtitle: string;
  currentJourney: PendingAssessment | null;
  lastCompletedAssessment: LastCompletedAssessment | null;
  history: HistoryItem[];
  metrics: DashboardMetrics;
  quickActions: QuickActionItem[];
  isLoading: boolean;
  error: string | null;
  handleRetry: () => void;
  labels: PainelLabels;
}
