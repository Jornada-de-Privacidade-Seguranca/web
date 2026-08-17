export interface ResultItem {
  id: string;
  title: string;
  description: string;
  score: number;
  completedAt: string;
  questionsCount: number;
}

export interface ResultsMetrics {
  totalCompleted: number;
  averageScore: number;
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

export interface ResultsLabels {
  title: string;
  subtitle: string;
  kpiTotalCompleted: string;
  kpiAverageScore: string;
  sectionTitle: string;
  sectionSubtitle: string;
  searchPlaceholder: string;
  searchEmpty: string;
  userEmpty: string;
  completedAt: (dateString: string) => string;
  questionsCount: (count: number) => string;
  viewResult: string;
  paginationPrevious: string;
  paginationNext: string;
  paginationPageOf: (current: number, total: number) => string;
  errorTitle: string;
  errorMessage: string;
  retryButton: string;
  loadingAriaLabel: string;
}

export interface ResultsViewModelReturn {
  metrics: ResultsMetrics | null;
  isMetricsLoading: boolean;

  results: ResultItem[];
  page: number;
  totalPages: number;
  isResultsLoading: boolean;
  searchTerm: string;
  handleSearchChange: (term: string) => void;
  handlePageChange: (page: number) => void;

  isLoading: boolean;
  error: string | null;
  serverMessage: ServerMessage | null;
  onCloseMsg: () => void;
  handleRetry: () => void;
  labels: ResultsLabels;
}
