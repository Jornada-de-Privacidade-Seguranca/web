export type JourneyDomain = "privacy" | "security" | "joint";

export type JourneyStatus = "not_started" | "in_progress" | "completed";

export type JourneyOrigin = "self_started" | "assigned";

export interface Journey {
  id: string;
  title: string;
  description: string;
  domain?: JourneyDomain;
  domainLabel?: string;
  competenciesCount?: number;
  /** Ausente quando o backend não fornece o dado (ex.: GET /users/{user}/journeys). */
  totalQuestions?: number;
  /** Ausente quando o backend não fornece o dado (ex.: GET /users/{user}/journeys). */
  estimatedMinutes?: number;
  status: JourneyStatus;
  score?: number;
  href?: string;
  origin?: JourneyOrigin;
  isSelfStarted?: boolean;
}

export interface JourneyFilters {
  domains: JourneyDomain[];
  statuses: JourneyStatus[];
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/** Situação da jornada como retornada por GET /users/{user}/journeys. */
export type UserJourneyApiStatus = "ongoing" | "completed";

export interface UserJourneyProfileSummaryApi {
  id: number | null;
  name_pt: string | null;
  name_en: string | null;
  description_pt: string | null;
  description_en: string | null;
  knowledge_domain: {
    id: number | null;
    name_pt: string | null;
    name_en: string | null;
  };
}

/** Item bruto de GET /users/{user}/journeys, antes do mapeamento para Journey. */
export interface UserJourneyListItemApi {
  id: number;
  user_id: number;
  user_name: string | null;
  journey_profile: UserJourneyProfileSummaryApi;
  started_at: string | null;
  finished_at: string | null;
  status: UserJourneyApiStatus;
  is_completed: boolean;
  summary: {
    acquired_knowledges_count: number;
    professional_certifications_count: number;
  };
}

export interface PaginationMetaApi {
  current_page: number;
  per_page: number;
  total: number;
  last_page: number;
  has_next_page: boolean;
}

export interface UserJourneyListMetaApi {
  pagination: PaginationMetaApi;
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
  actionCancel: string;
  assignedBadge: string;
  inProgressBadge: string;
  completedScoreBadge: (score: number) => string;
  competenciesCount: (count: number) => string;
  questionsCount: (count: number) => string;
  estimatedMinutes: (minutes: number) => string;
  filtersButton: string;
  filtersButtonWithCount: (count: number) => string;
  filtersPanelTitle: string;
  filtersClear: string;
  filterDomainTitle: string;
  filterDomainPrivacy: string;
  filterDomainSecurity: string;
  filterDomainJoint: string;
  filterStatusTitle: string;
  filterStatusCompleted: string;
  filterStatusNotStarted: string;
  filterStatusInProgress: string;
  cancelModalTitle: string;
  cancelModalDescription: string;
  cancelModalKeep: string;
  cancelModalConfirm: string;
  paginationPrevious: string;
  paginationNext: string;
  paginationPageOf: (current: number, total: number) => string;
  errorTitle: string;
  errorMessage: string;
  retryButton: string;
  loadingAriaLabel: string;
}

export interface AssessmentsViewModelReturn {
  /** No máximo uma jornada pendente em destaque */
  pendingJourney: Journey | null;
  hasPendingJourney: boolean;
  isPendingLoading: boolean;
  pendingError: string | null;
  handleRetryPending: () => void;

  /** Modal de confirmação de cancelamento */
  isCancelModalOpen: boolean;
  handleOpenCancelModal: () => void;
  handleCloseCancelModal: () => void;
  handleConfirmCancelJourney: () => void;

  /** Catálogo de jornadas filtrado e paginado */
  catalogJourneys: Journey[];
  catalogPage: number;
  catalogTotalPages: number;
  catalogTotalItems: number;
  isCatalogLoading: boolean;
  catalogError: string | null;
  searchTerm: string;
  handleSearchChange: (term: string) => void;
  handleCatalogPageChange: (page: number) => void;
  handleRetryCatalog: () => void;
  catalogPageError: string | null;
  dismissCatalogPageError: () => void;

  /** Painel de filtros */
  isFilterPanelOpen: boolean;
  handleToggleFilterPanel: () => void;
  activeFiltersCount: number;
  filters: JourneyFilters;
  handleToggleDomainFilter: (domain: JourneyDomain) => void;
  handleToggleStatusFilter: (status: JourneyStatus) => void;
  handleClearFilters: () => void;

  labels: AssessmentsLabels;
}
