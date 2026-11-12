import type {
  ActiveJourney,
  ActiveJourneySectionLabels,
} from "../../adminUserDetail.types";

export interface ActiveJourneySectionProps {
  activeJourney: ActiveJourney | null;
  canAssignJourney: boolean;
  canCancelAssignment: boolean;
  journeySuccessMessage: string | null;
  labels: ActiveJourneySectionLabels;
  onAssignClick: () => void;
  onCancelAssignClick: () => void;
  onDismissSuccessMessage: () => void;
}

export interface ActiveJourneySectionViewModelReturn {
  activeJourney: ActiveJourney | null;
  hasActiveJourney: boolean;
  isAssignDisabled: boolean;
  canAssignJourney: boolean;
  canCancelAssignment: boolean;
  domainLabel: string;
  formattedStartedAt: string;
  originText: string;
  journeySuccessMessage: string | null;
  labels: ActiveJourneySectionLabels;
  onAssignClick: () => void;
  onCancelAssignClick: () => void;
  onDismissSuccessMessage: () => void;
}

