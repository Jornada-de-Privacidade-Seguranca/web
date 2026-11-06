import type {
  UserFiltersProps,
  UserFiltersViewModelReturn,
} from "./userFilters.types";

export function useUserFiltersVM(
  props: UserFiltersProps
): UserFiltersViewModelReturn {
  const {
    filters,
    availableDepartments,
    availableRoles,
    availableStatuses,
    filteredTotal,
    totalUsers,
    hasActiveFilters,
    onSearchChange,
    onDepartmentChange,
    onRoleChange,
    onStatusChange,
    onClearFilters,
    labels,
  } = props;

  return {
    search: filters.search,
    department: filters.department,
    role: filters.role,
    status: filters.status,
    availableDepartments,
    availableRoles,
    availableStatuses,
    counterText: labels.filterCounter(filteredTotal, totalUsers),
    hasActiveFilters,
    onSearchChange,
    onDepartmentChange,
    onRoleChange,
    onStatusChange,
    onClearFilters,
    searchPlaceholder: labels.searchPlaceholder,
    departmentLabel: labels.filterDepartment,
    allDepartmentsLabel: labels.filterAllDepartments,
    roleLabel: labels.filterRole,
    allRolesLabel: labels.filterAllRoles,
    statusLabel: labels.filterStatus,
    allStatusesLabel: labels.filterAllStatuses,
    clearLabel: labels.filterClear,
  };
}
