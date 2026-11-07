import type {
  JourneyDomain,
  JourneyStatus,
  JourneyFilters,
  AssessmentsLabels,
} from "../../assessments.types";

export interface JourneyFilterPanelProps {
  isOpen: boolean;
  filters: JourneyFilters;
  labels: AssessmentsLabels;
  onToggleDomain: (domain: JourneyDomain) => void;
  onToggleStatus: (status: JourneyStatus) => void;
  onClearFilters: () => void;
}

export interface FilterOption<T> {
  id: T;
  label: string;
  isSelected: boolean;
}

export interface JourneyFilterPanelViewModelReturn {
  isOpen: boolean;
  domainOptions: FilterOption<JourneyDomain>[];
  statusOptions: FilterOption<JourneyStatus>[];
  domainTitle: string;
  statusTitle: string;
  clearLabel: string;
  hasActiveFilters: boolean;
  onToggleDomain: (domain: JourneyDomain) => void;
  onToggleStatus: (status: JourneyStatus) => void;
  onClearFilters: () => void;
}

