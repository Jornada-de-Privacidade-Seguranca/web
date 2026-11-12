import type {
  ActiveJourneySectionProps,
  ActiveJourneySectionViewModelReturn,
} from "./activeJourneySection.types";

export function useActiveJourneySectionVM(
  props: ActiveJourneySectionProps
): ActiveJourneySectionViewModelReturn {
  const {
    activeJourney,
    canAssignJourney,
    canCancelAssignment,
    journeySuccessMessage,
    labels,
    onAssignClick,
    onCancelAssignClick,
    onDismissSuccessMessage,
  } = props;

  const hasActiveJourney = Boolean(activeJourney);
  const domainLabel = activeJourney ? labels.domains[activeJourney.domain] : "";
  const formattedStartedAt = activeJourney
    ? labels.startedAt(new Date(activeJourney.startedAt).toLocaleDateString())
    : "";

  const originText = !activeJourney
    ? ""
    : activeJourney.origin === "self_started"
      ? labels.originSelf
      : labels.originAssigned(
          (activeJourney.assignedBy ?? activeJourney.assigned_by)?.name ?? ""
        );

  return {
    activeJourney,
    hasActiveJourney,
    isAssignDisabled: hasActiveJourney,
    canAssignJourney,
    canCancelAssignment,
    domainLabel,
    formattedStartedAt,
    originText,
    journeySuccessMessage,
    labels,
    onAssignClick,
    onCancelAssignClick,
    onDismissSuccessMessage,
  };
}

