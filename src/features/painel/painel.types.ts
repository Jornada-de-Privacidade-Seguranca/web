export type PendingAssessmentStatus = "pending" | "in_progress";

export interface PendingAssessment {
  id: string;
  title: string;
  description: string;
  status: PendingAssessmentStatus;
  totalQuestions: number;
  estimatedMinutes: number;
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

export interface DashboardDataResponse {
  pending: PendingAssessment | null;
  lastCompleted: LastCompletedAssessment | null;
  history: HistoryItem[];
}

export interface PainelLabels {
  greetingSubtitle: string;
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
}

export interface PainelViewModelReturn {
  userFirstName: string;
  greetingTitle: string;
  greetingSubtitle: string;
  pendingAssessment: PendingAssessment | null;
  lastCompletedAssessment: LastCompletedAssessment | null;
  history: HistoryItem[];
  isLoading: boolean;
  error: string | null;
  handleRetry: () => void;
  labels: PainelLabels;
}
