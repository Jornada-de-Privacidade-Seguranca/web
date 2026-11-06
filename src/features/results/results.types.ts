import type { JourneyDomain } from "@services/journeyService";

export type { JourneyDomain };

export interface ResultItem {
  id: string;
  title: string;
  score: number;
  completedAt: string;
  domain?: JourneyDomain;
  domainLabel?: string;
  description?: string;
  questionsCount?: number;
}

export interface DomainMetric {
  domain: string;
  label: string;
  averageScore: number | null;
}

export interface ResultsMetrics {
  totalCompleted: number;
  averageScore?: number | null;
  domainMetrics: DomainMetric[];
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

export type ResultsEmptyStateMode = "none" | "no-results" | "no-search-matches";

export interface ResultsFilters {
  domains: JourneyDomain[];
}

export interface FilterOption<T extends string = string> {
  id: T;
  label: string;
  isSelected: boolean;
}

export interface ResultsLabels {
  title: string;
  subtitle: string;
  kpiTotalCompleted: string;
  kpiAverageScore: string;
  kpiDomainScore: (score: number) => string;
  kpiEmptyScore: string;
  sectionTitle: string;
  sectionSubtitle: string;
  searchPlaceholder: string;
  searchEmptyTitle: string;
  searchEmpty: string;
  userEmptyTitle: string;
  userEmpty: string;
  availableJourneysCta: string;
  completedAt: (dateString: string) => string;
  completedScoreTag: (score: number) => string;
  questionsCount: (count: number) => string;
  viewResult: string;
  filtersButton: string;
  filtersButtonWithCount: (count: number) => string;
  filtersTitle: string;
  filtersDomainTitle: string;
  filtersClear: string;
  filterDomainPrivacy: string;
  filterDomainSecurity: string;
  filterDomainJoint: string;
  paginationPrevious: string;
  paginationNext: string;
  paginationPageOf: (current: number, total: number) => string;
  errorTitle: string;
  errorMetricsMessage: string;
  errorMessage: string;
  retryButton: string;
  loadingAriaLabel: string;
  scoreAriaLabel: (score: number) => string;
}

export interface ResultsViewModelReturn {
  metrics: ResultsMetrics | null;
  isMetricsLoading: boolean;
  isMetricsError: boolean;

  results: ResultItem[];
  page: number;
  totalPages: number;
  isResultsLoading: boolean;
  isResultsError: boolean;
  resultsErrorMessage: string | null;
  emptyState: ResultsEmptyStateMode;

  searchTerm: string;
  handleSearchChange: (term: string) => void;
  handlePageChange: (page: number) => void;

  // Filter Panel
  isFilterPanelOpen: boolean;
  handleToggleFilterPanel: () => void;
  activeFiltersCount: number;
  filters: ResultsFilters;
  handleToggleDomainFilter: (domain: JourneyDomain) => void;
  handleClearFilters: () => void;

  isLoading: boolean;
  error: string | null;
  serverMessage: ServerMessage | null;
  onCloseMsg: () => void;
  handleRetry: () => void;
  labels: ResultsLabels;
}
