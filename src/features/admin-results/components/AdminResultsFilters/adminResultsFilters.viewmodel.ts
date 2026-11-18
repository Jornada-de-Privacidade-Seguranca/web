import type {
  AdminDomainFilterOption,
  AdminResultsFiltersProps,
  AdminResultsFiltersViewModelReturn,
} from "./adminResultsFilters.types";

export function useAdminResultsFiltersVM(
  props: AdminResultsFiltersProps
): AdminResultsFiltersViewModelReturn {
  const {
    filters,
    filterOptions,
    filteredTotal,
    totalResults,
    hasActiveFilters,
    isOptionsLoading,
    labels,
    onSearchChange,
    onUserChange,
    onDepartmentChange,
    onToggleDomain,
    onProfileChange,
    onDateFromChange,
    onDateToChange,
    onClearFilters,
  } = props;

  const domainOptions: AdminDomainFilterOption[] = filterOptions.domains.map((domain) => ({
    id: domain.id,
    label: domain.label,
    isSelected: filters.domains.includes(domain.id),
  }));

  return {
    search: filters.search,
    userId: filters.userId,
    department: filters.department,
    journeyProfileId: filters.journeyProfileId,
    dateFrom: filters.dateFrom,
    dateTo: filters.dateTo,
    users: filterOptions.users,
    departments: filterOptions.departments,
    domainOptions,
    journeyProfiles: filterOptions.journeyProfiles,
    counterText: labels.filterCounter(filteredTotal, totalResults),
    hasActiveFilters,
    isOptionsLoading,
    labels,
    onSearchChange,
    onUserChange,
    onDepartmentChange,
    onToggleDomain,
    onProfileChange,
    onDateFromChange,
    onDateToChange,
    onClearFilters,
  };
}

