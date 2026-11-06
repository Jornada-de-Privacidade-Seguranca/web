import type {
  JourneyFilterPanelProps,
  JourneyFilterPanelViewModelReturn,
  FilterOption,
} from "./journeyFilterPanel.types";
import type { JourneyDomain, JourneyStatus } from "../../assessments.types";

export function useJourneyFilterPanelVM(
  props: JourneyFilterPanelProps
): JourneyFilterPanelViewModelReturn {
  const {
    isOpen,
    filters,
    labels,
    onToggleDomain,
    onToggleStatus,
    onClearFilters,
  } = props;

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

  const statusOptions: FilterOption<JourneyStatus>[] = [
    {
      id: "completed",
      label: labels.filterStatusCompleted,
      isSelected: filters.statuses.includes("completed"),
    },
    {
      id: "not_started",
      label: labels.filterStatusNotStarted,
      isSelected: filters.statuses.includes("not_started"),
    },
    {
      id: "in_progress",
      label: labels.filterStatusInProgress,
      isSelected: filters.statuses.includes("in_progress"),
    },
  ];

  const hasActiveFilters =
    filters.domains.length > 0 || filters.statuses.length > 0;

  return {
    isOpen,
    domainOptions,
    statusOptions,
    domainTitle: labels.filterDomainTitle,
    statusTitle: labels.filterStatusTitle,
    clearLabel: labels.filtersClear,
    hasActiveFilters,
    onToggleDomain,
    onToggleStatus,
    onClearFilters,
  };
}

