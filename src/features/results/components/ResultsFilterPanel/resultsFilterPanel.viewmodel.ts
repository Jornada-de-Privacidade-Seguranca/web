import type {
  ResultsFilterPanelProps,
  ResultsFilterPanelViewModelReturn,
} from "./resultsFilterPanel.types";
import type { FilterOption, JourneyDomain } from "../../results.types";

export function useResultsFilterPanelVM(
  props: ResultsFilterPanelProps
): ResultsFilterPanelViewModelReturn {
  const { isOpen, filters, labels, onToggleDomain, onClearFilters } = props;

  const domainOptions: FilterOption<JourneyDomain>[] = [
    {
      id: "privacy",
      label: labels.filterDomainPrivacy,
      isSelected: filters.domains.includes("privacy"),
    },
    {
      id: "security",
      label: labels.filterDomainSecurity,
      isSelected: filters.domains.includes("security"),
    },
    {
      id: "joint",
      label: labels.filterDomainJoint,
      isSelected: filters.domains.includes("joint"),
    },
  ];

  const hasActiveFilters = filters.domains.length > 0;

  return {
    isOpen,
    domainOptions,
    panelTitle: labels.filtersTitle,
    domainTitle: labels.filtersDomainTitle,
    clearLabel: labels.filtersClear,
    hasActiveFilters,
    onToggleDomain,
    onClearFilters,
  };
}
