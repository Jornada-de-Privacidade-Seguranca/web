import type {
  AdminUsersFilters,
  AdminUsersLabels,
  SelectOption,
} from "../../adminUsers.types";

export interface UserFiltersProps {
  filters: AdminUsersFilters;
  availableDepartments: string[];
  availableRoles: SelectOption[];
  availableStatuses: SelectOption[];
  filteredTotal: number;
  totalUsers: number;
  hasActiveFilters: boolean;
  onSearchChange: (search: string) => void;
  onDepartmentChange: (dep: string) => void;
  onRoleChange: (role: string) => void;
  onStatusChange: (status: string) => void;
  onClearFilters: () => void;
  labels: AdminUsersLabels;
}

export interface UserFiltersViewModelReturn {
  search: string;
  department: string;
  role: string;
  status: string;
  availableDepartments: string[];
  availableRoles: SelectOption[];
  availableStatuses: SelectOption[];
  counterText: string;
  hasActiveFilters: boolean;
  onSearchChange: (search: string) => void;
  onDepartmentChange: (dep: string) => void;
  onRoleChange: (role: string) => void;
  onStatusChange: (status: string) => void;
  onClearFilters: () => void;
  searchPlaceholder: string;
  departmentLabel: string;
  allDepartmentsLabel: string;
  roleLabel: string;
  allRolesLabel: string;
  statusLabel: string;
  allStatusesLabel: string;
  clearLabel: string;
}
