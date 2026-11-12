import type {
  AssignableJourneyOption,
  AssignJourneyModalLabels,
} from "../../adminUserDetail.types";

export interface AssignJourneyModalProps {
  isOpen: boolean;
  options: AssignableJourneyOption[];
  isFirstJourney: boolean;
  selectedProfileId: number | null;
  isSubmitting: boolean;
  errorMessage?: string | null;
  labels: AssignJourneyModalLabels;
  onSelectProfile: (profileId: number) => void;
  onCancel: () => void;
  onConfirm: () => void;
}

export interface AssignJourneyModalViewModelReturn {
  isOpen: boolean;
  options: AssignableJourneyOption[];
  isFirstJourney: boolean;
  selectedProfileId: number | null;
  isSubmitting: boolean;
  errorMessage: string | null;
  canConfirm: boolean;
  labels: AssignJourneyModalLabels;
  onSelectProfile: (profileId: number) => void;
  onCancel: () => void;
  onConfirm: () => void;
}

