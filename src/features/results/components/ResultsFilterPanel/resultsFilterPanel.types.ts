import type {
  ResultsFilters,
  ResultsLabels,
  FilterOption,
  JourneyDomain,
} from "../../results.types";

export interface ResultsFilterPanelProps {
  isOpen: boolean;
  filters: ResultsFilters;
  labels: ResultsLabels;
  onToggleDomain: (domain: JourneyDomain) => void;
  onClearFilters: () => void;
}

export interface ResultsFilterPanelViewModelReturn {
  isOpen: boolean;
  domainOptions: FilterOption<JourneyDomain>[];
  panelTitle: string;
  domainTitle: string;
  clearLabel: string;
  hasActiveFilters: boolean;
  onToggleDomain: (domain: JourneyDomain) => void;
  onClearFilters: () => void;
}
