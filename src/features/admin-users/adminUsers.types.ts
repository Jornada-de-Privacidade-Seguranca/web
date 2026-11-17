export type UserStatus = "active" | "pending" | "inactive";
export type UserRole = "admin" | "manager" | "user";

export interface AdminUserListItem {
  id: string;
  name: string;
  email: string;
  initials: string;
  employeeCode: string;
  department: string;
  /** Perfil de acesso (Administrador, Gestor ou Usuário); "user" quando a conta não tem perfil. */
  role: UserRole;
  /** Id do perfil em TB_TIPO_PERFIL, ou null quando a conta não tem perfil. */
  profileTypeId: number | null;
  roleLabel: string;
  status: UserStatus;
  /** Jornadas finalizadas (sem as em andamento e as canceladas). */
  journeysCount: number;
  organization: string;
  createdAt: string;
}

export interface AccessProfile {
  /** Id do perfil em TB_TIPO_PERFIL. */
  id: number;
  /** Perfil conhecido pelo front, ou null para um perfil criado só no backend. */
  role: UserRole | null;
  name: string;
  description: string;
  isDefault?: boolean;
  /** Descrição das permissões no idioma atual. */
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
  role?: UserRole | "";
  status?: UserStatus | "";
  page?: number;
  perPage?: number;
}

export interface PaginatedUsersResponse {
  items: AdminUserListItem[];
  /** Total de usuários que atendem à busca e aos filtros. */
  total: number;
  page: number;
  perPage: number;
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
  profilesErrorMessage: string;
  retryButton: string;
  inviteButton: string;
  closeMessage: string;
}

export interface SelectOption {
  value: string;
  label: string;
}

export interface AdminUsersStore {
  invitedEmail: string | null;
  setInvitedEmail: (email: string | null) => void;
  clearInvitedEmail: () => void;
  /** Nome (ou e-mail) do usuário excluído, para o aviso de sucesso na listagem. */
  deletedUserName: string | null;
  setDeletedUserName: (name: string | null) => void;
  clearDeletedUserName: () => void;
  /** Query string da listagem (busca, filtros e página), para o "Voltar" do detalhe. */
  listQuery: string;
  setListQuery: (query: string) => void;
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
  isProfilesError: boolean;
  handleRetryProfiles: () => void;
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
  canInviteUsers: boolean;
  inviteSuccessMessage: string | null;
  handleDismissInviteMessage: () => void;
  deleteSuccessMessage: string | null;
  handleDismissDeleteMessage: () => void;
  labels: AdminUsersLabels;
}
