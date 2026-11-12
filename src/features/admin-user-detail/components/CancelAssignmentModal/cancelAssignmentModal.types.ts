import type { CancelAssignmentModalLabels } from "../../adminUserDetail.types";

export interface CancelAssignmentModalProps {
  isOpen: boolean;
  journeyTitle: string;
  isCancelling: boolean;
  errorMessage?: string | null;
  labels: CancelAssignmentModalLabels;
  onKeep: () => void;
  onConfirm: () => void;
}

export interface CancelAssignmentModalViewModelReturn {
  isOpen: boolean;
  title: string;
  description: string;
  keepText: string;
  confirmText: string;
  cancellingText: string;
  isCancelling: boolean;
  errorMessage: string | null;
  onKeep: () => void;
  onConfirm: () => void;
}

