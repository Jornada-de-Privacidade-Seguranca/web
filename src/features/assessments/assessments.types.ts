export type JourneyStatus = "not_started" | "in_progress" | "completed";

export interface Journey {
  id: string;
  title: string;
  description: string;
  totalQuestions: number;
  estimatedMinutes: number;
  status: JourneyStatus;
  score?: number;
  href?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
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
  pendingError: string | null;
  isPendingSectionVisible: boolean;
  handlePendingPageChange: (page: number) => void;
  handleRetryPending: () => void;
  /** Erro pontual ao trocar de página (dados anteriores continuam exibidos). */
  pendingPageError: string | null;
  dismissPendingPageError: () => void;

  catalogJourneys: Journey[];
  catalogPage: number;
  catalogTotalPages: number;
  isCatalogLoading: boolean;
  catalogError: string | null;
  searchTerm: string;
  handleSearchChange: (term: string) => void;
  handleCatalogPageChange: (page: number) => void;
  handleRetryCatalog: () => void;
  /** Erro pontual ao trocar de página (dados anteriores continuam exibidos). */
  catalogPageError: string | null;
  dismissCatalogPageError: () => void;

  labels: AssessmentsLabels;
}
