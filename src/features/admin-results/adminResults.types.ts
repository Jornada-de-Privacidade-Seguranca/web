import type { JourneyDomain } from "@services/journeyService";
import type { ScoreBand } from "@shared/utils/scoreBand";

export type { JourneyDomain, ScoreBand };

export interface AdminResultUser {
  id: string;
  name: string;
  email: string;
  initials: string;
  department: string;
}

export interface AdminResultItem {
  id: string;
  journeyId: string;
  user: AdminResultUser;
  profileId: string;
  profileTitle: string;
  profileNamePt: string;
  profileNameEn: string;
  domain: JourneyDomain;
  domainNamePt: string;
  domainNameEn: string;
  domainLabel: string;
  completedAt: string;
  score: number;
  scoreBand: ScoreBand;
}

export interface AdminDomainAverage {
  domain: JourneyDomain;
  namePt: string;
  nameEn: string;
  label: string;
  averageScore: number | null;
  completedCount: number;
}

export interface AdminResultsSummary {
  totalCompletedJourneys: number;
  totalEvaluatedUsers: number;
  domainAverages: AdminDomainAverage[];
}

export interface AdminResultUserOption {
  id: string;
  name: string;
  email: string;
}

export interface AdminResultProfileOption {
  id: string;
  namePt: string;
  nameEn: string;
  label: string;
}

export interface AdminResultDomainOption {
  id: JourneyDomain;
  namePt: string;
  nameEn: string;
  label: string;
}

export interface AdminResultsFilterOptions {
  users: AdminResultUserOption[];
  departments: string[];
  domains: AdminResultDomainOption[];
  journeyProfiles: AdminResultProfileOption[];
}

export interface AdminResultsFilters {
  search: string;
  userId: string;
  department: string;
  domains: JourneyDomain[];
  journeyProfileId: string;
  dateFrom: string;
  dateTo: string;
}

export interface GetAdminResultsParams {
  search?: string;
  userId?: string;
  department?: string;
  domains?: JourneyDomain[];
  journeyProfileId?: string;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  perPage?: number;
}

export interface AdminResultsResponse {
  items: AdminResultItem[];
  total: number;
  filteredTotal: number;
  page: number;
  limit: number;
  totalPages: number;
  summary: AdminResultsSummary;
  filterOptions: AdminResultsFilterOptions;
}

export interface AdminResultsLabels {
  title: string;
  subtitle: string;
  summaryAriaLabel: string;
  summaryTotalCompleted: string;
  summaryTotalUsers: string;
  summaryDomainScore: (score: number) => string;
  summaryEmptyScore: string;
  filtersAriaLabel: string;
  searchPlaceholder: string;
  filterUser: string;
  filterAllUsers: string;
  filterDepartment: string;
  filterAllDepartments: string;
  filterProfile: string;
  filterAllProfiles: string;
  filterDomains: string;
  filterDateFrom: string;
  filterDateTo: string;
  filterClear: string;
  filterCounter: (filtered: number, total: number) => string;
  tableUser: string;
  tableDepartment: string;
  tableProfile: string;
  tableDomain: string;
  tableCompletedAt: string;
  tableScore: string;
  tableActions: string;
  tableView: string;
  tableEmptyDepartment: string;
  scoreValue: (score: number) => string;
  scoreBandLabel: (band: ScoreBand) => string;
  scoreAriaLabel: (score: number, band: ScoreBand) => string;
  formatDate: (isoDate: string) => string;
  emptyTitle: string;
  emptyDescription: string;
  emptyNoDataTitle: string;
  emptyNoDataDescription: string;
  emptyClearButton: string;
  paginationPrevious: string;
  paginationNext: string;
  paginationPageOf: (current: number, total: number) => string;
  errorTitle: string;
  errorMessage: string;
  retryButton: string;
  loadingAriaLabel: string;
}

export interface AdminResultsViewModelReturn {
  summary: AdminResultsSummary;
  results: AdminResultItem[];
  totalResults: number;
  filteredTotal: number;
  page: number;
  totalPages: number;
  isLoading: boolean;
  isError: boolean;
  errorMessage: string | null;
  hasActiveFilters: boolean;
  filters: AdminResultsFilters;
  filterOptions: AdminResultsFilterOptions;
  handleSearchChange: (search: string) => void;
  handleUserChange: (userId: string) => void;
  handleDepartmentChange: (department: string) => void;
  handleToggleDomain: (domain: JourneyDomain) => void;
  handleProfileChange: (journeyProfileId: string) => void;
  handleDateFromChange: (dateFrom: string) => void;
  handleDateToChange: (dateTo: string) => void;
  handleClearFilters: () => void;
  handlePageChange: (newPage: number) => void;
  handleRetry: () => void;
  labels: AdminResultsLabels;
}

