export type JourneyStatus = "not_started" | "in_progress" | "completed";

export interface Journey {
  id: string;
  title: string;
  description: string;
  totalQuestions: number;
  estimatedMinutes: number;
  status: JourneyStatus;
  score?: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ServerMessage {
  title: string;
  description: string;
  variant: "destructive" | "success";
}

export interface AssessmentsLabels {
  title: string;
  subtitle: string;
  pendingSectionTitle: string;
  pendingSectionSubtitle: string;
  pendingEmpty: string;
  catalogSectionTitle: string;
  catalogSectionSubtitle: string;
  catalogSearchPlaceholder: string;
  catalogEmpty: string;
  statusCompleted: string;
  statusInProgress: string;
  statusNotStarted: string;
  actionStart: string;
  actionContinue: string;
  actionRetake: string;
  questionsCount: (count: number) => string;
  estimatedMinutes: (minutes: number) => string;
  paginationPrevious: string;
  paginationNext: string;
  paginationPageOf: (current: number, total: number) => string;
  errorTitle: string;
  errorMessage: string;
  retryButton: string;
  loadingAriaLabel: string;
}

export interface AssessmentsViewModelReturn {
  pendingJourneys: Journey[];
  pendingPage: number;
  pendingTotalPages: number;
  isPendingLoading: boolean;
  isPendingSectionVisible: boolean;
  handlePendingPageChange: (page: number) => void;

  catalogJourneys: Journey[];
  catalogPage: number;
  catalogTotalPages: number;
  isCatalogLoading: boolean;
  searchTerm: string;
  handleSearchChange: (term: string) => void;
  handleCatalogPageChange: (page: number) => void;

  isLoading: boolean;
  error: string | null;
  serverMessage: ServerMessage | null;
  onCloseMsg: () => void;
  handleRetry: () => void;
  labels: AssessmentsLabels;
}
