import type { JourneyDomain } from "@services/journeyService";

/**
 * Identificador oficial da etapa de experiência profissional enviado ao backend.
 * Rota correspondente na aplicação web: /experiencia-profissional
 */
export const EXPERIENCE_STEP_ID = "experience" as const;
export type ExperienceStepId = typeof EXPERIENCE_STEP_ID;

export type ExperienceOptionId =
  | "none"
  | "less-than-1-year"
  | "1-3-years"
  | "4-6-years"
  | "7-10-years"
  | "10-plus-years";

export interface ExperienceOption {
  id: ExperienceOptionId;
  label: string;
}

export interface ExperienceStepLabels {
  stepTag: string;
  title: string;
  description: string;
  questionLabels: Record<JourneyDomain, string>;
  options: Record<ExperienceOptionId, string>;
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
  notFoundTitle: string;
  notFoundMessage: string;
  backToJourneysLink: string;
}

export interface ExperienceStepViewModelReturn {
  journeyId: string;
  journeyTitle: string;
  questionLabel: string;
  selectedOption: ExperienceOptionId | null;
  isLoading: boolean;
  isSubmitting: boolean;
  isContinueDisabled: boolean;
  isNotFound: boolean;
  isExitModalOpen: boolean;
  error: string | null;
  options: ExperienceOption[];
  labels: ExperienceStepLabels;
  journeysHref: string;
  handleSelectOption: (id: ExperienceOptionId) => void;
  handleContinue: () => void;
  handleBack: () => void;
  handleExit: () => void;
  handleCancelExit: () => void;
  handleConfirmExit: () => void;
  handleRetry: () => void;
}

export interface ExperienceStepViewProps {
  journeyId: string;
}
