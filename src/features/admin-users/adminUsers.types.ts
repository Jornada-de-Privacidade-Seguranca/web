export type UserStatus = "active" | "pending" | "inactive";
export type UserRole = "admin" | "manager" | "user";

export interface AdminUserListItem {
  id: string;
  name: string;
  email: string;
  initials: string;
  employeeCode: string;
  department: string;
  role: UserRole;
  roleLabel: string;
  status: UserStatus;
  journeysCount: number;
  organization: string;
  createdAt: string;
}

export interface AccessProfile {
  id: UserRole;
  name: string;
  description: string;
  isDefault?: boolean;
  permissions: string[];
}

export interface UserCompletedJourney {
  id: string;
  title: string;
  domain: "privacy" | "security" | "joint";
  domainLabel: string;
  completedAt: string;
  score: number;
}

export interface GetUsersListParams {
  search?: string;
  department?: string;
  role?: string;
  status?: string;
  page?: number;
  limit?: number;
  per_page?: number;
}

export interface PaginatedUsersResponse {
  items: AdminUserListItem[];
  total: number;
  filteredTotal: number;
  page: number;
  limit: number;
  totalPages: number;
}

export type AdminUsersTab = "users" | "roles";

export interface AdminUsersFilters {
  search: string;
  department: string;
  role: string;
  status: string;
}

export interface AdminUsersLabels {
  title: string;
  subtitle: string;
  tabUsers: string;
  tabRoles: string;
  searchPlaceholder: string;
  filterDepartment: string;
  filterAllDepartments: string;
  filterRole: string;
  filterAllRoles: string;
  filterStatus: string;
  filterAllStatuses: string;
  filterStatusActive: string;
  filterStatusPending: string;
  filterStatusInactive: string;
  filterClear: string;
  filterCounter: (filtered: number, total: number) => string;
  tableUser: string;
  tableEmployeeCode: string;
  tableDepartment: string;
  tableRole: string;
  tableStatus: string;
  tableJourneys: string;
  tableActions: string;
  tableManage: string;
  rolesTitle: string;
  rolesSubtitle: string;
  rolesDefaultBadge: string;
  rolesPermissionsTitle: string;
  rolesHistoryNotice: string;
  emptyTitle: string;
  emptyDescription: string;
  emptyClearButton: string;
  paginationPrevious: string;
  paginationNext: string;
  paginationPageOf: (current: number, total: number) => string;
  errorTitle: string;
  errorMessage: string;
  retryButton: string;
}

export interface SelectOption {
  value: string;
  label: string;
}

export interface AdminUsersViewModelReturn {
  currentTab: AdminUsersTab;
  handleTabChange: (tab: AdminUsersTab) => void;
  users: AdminUserListItem[];
  totalUsers: number;
  filteredTotal: number;
  page: number;
  totalPages: number;
  handlePageChange: (newPage: number) => void;
  isLoading: boolean;
  isError: boolean;
  errorMessage: string | null;
  handleRetry: () => void;
  filters: AdminUsersFilters;
  availableDepartments: string[];
  availableRoles: SelectOption[];
  availableStatuses: SelectOption[];
  handleSearchChange: (search: string) => void;
  handleDepartmentChange: (department: string) => void;
  handleRoleChange: (role: string) => void;
  handleStatusChange: (status: string) => void;
  handleClearFilters: () => void;
  hasActiveFilters: boolean;
  accessProfiles: AccessProfile[];
  isProfilesLoading: boolean;
  labels: AdminUsersLabels;
}
