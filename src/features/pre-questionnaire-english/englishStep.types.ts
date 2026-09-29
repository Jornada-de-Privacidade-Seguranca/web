export type EnglishOptionId =
  | "none"
  | "basic-reading"
  | "intermediate-reading-writing"
  | "advanced-fluent";

export interface EnglishOption {
  id: EnglishOptionId;
  label: string;
}

export interface EnglishStepLabels {
  stepTag: string;
  title: string;
  description: string;
  questionLabel: string;
  options: Record<EnglishOptionId, string>;
  backLabel: string;
  backAriaLabel: string;
  continueLabel: string;
  savingLabel: string;
  exitLabel: string;
  exitAriaLabel: string;
  exitModal: {
    title: string;
    description: string;
    cancelButton: string;
    confirmButton: string;
  };
  loadingText: string;
  errorTitle: string;
  errorMessage: string;
  retryButton: string;
}

export interface EnglishStepViewModelReturn {
  journeySlug: string;
  journeyTitle: string;
  selectedOption: EnglishOptionId | null;
  isLoading: boolean;
  isSubmitting: boolean;
  isExitModalOpen: boolean;
  error: string | null;
  options: EnglishOption[];
  labels: EnglishStepLabels;
  handleSelectOption: (id: EnglishOptionId) => void;
  handleContinue: () => void;
  handleBack?: () => void;
  handleExit: () => void;
  handleCancelExit: () => void;
  handleConfirmExit: () => void;
  handleRetry: () => void;
}
