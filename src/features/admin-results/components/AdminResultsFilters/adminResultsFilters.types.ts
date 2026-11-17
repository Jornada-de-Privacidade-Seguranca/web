import type {
  AdminResultProfileOption,
  AdminResultUserOption,
  AdminResultsFilterOptions,
  AdminResultsFilters,
  AdminResultsLabels,
  JourneyDomain,
} from "../../adminResults.types";

export interface AdminDomainFilterOption {
  id: JourneyDomain;
  label: string;
  isSelected: boolean;
}

export interface AdminResultsFiltersProps {
  filters: AdminResultsFilters;
  filterOptions: AdminResultsFilterOptions;
  filteredTotal: number;
  totalResults: number;
  hasActiveFilters: boolean;
  onSearchChange: (search: string) => void;
  onUserChange: (userId: string) => void;
  onDepartmentChange: (department: string) => void;
  onToggleDomain: (domain: JourneyDomain) => void;
  onProfileChange: (journeyProfileId: string) => void;
  onDateFromChange: (dateFrom: string) => void;
  onDateToChange: (dateTo: string) => void;
  onClearFilters: () => void;
  labels: Pick<
    AdminResultsLabels,
    | "filtersAriaLabel"
    | "searchPlaceholder"
    | "filterUser"
    | "filterAllUsers"
    | "filterDepartment"
    | "filterAllDepartments"
    | "filterProfile"
    | "filterAllProfiles"
    | "filterDomains"
    | "filterDateFrom"
    | "filterDateTo"
    | "filterClear"
    | "filterCounter"
  >;
}

export interface AdminResultsFiltersViewModelReturn {
  search: string;
  userId: string;
  department: string;
  journeyProfileId: string;
  dateFrom: string;
  dateTo: string;
  users: AdminResultUserOption[];
  departments: string[];
  domainOptions: AdminDomainFilterOption[];
  journeyProfiles: AdminResultProfileOption[];
  counterText: string;
  hasActiveFilters: boolean;
  labels: AdminResultsFiltersProps["labels"];
  onSearchChange: (search: string) => void;
  onUserChange: (userId: string) => void;
  onDepartmentChange: (department: string) => void;
  onToggleDomain: (domain: JourneyDomain) => void;
  onProfileChange: (journeyProfileId: string) => void;
  onDateFromChange: (dateFrom: string) => void;
  onDateToChange: (dateTo: string) => void;
  onClearFilters: () => void;
}

