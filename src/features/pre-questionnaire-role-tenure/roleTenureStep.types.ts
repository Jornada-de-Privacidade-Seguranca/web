/**
 * Identificador oficial da etapa de tempo de atuação enviado ao backend.
 * Rota correspondente na aplicação web: /tempo-atuacao-perfil
 */
export const ROLE_TENURE_STEP_ID = "role-tenure" as const;
export type RoleTenureStepId = typeof ROLE_TENURE_STEP_ID;

export type RoleTenureOptionId =
  | "0-years"
  | "1-3-years"
  | "4-6-years"
  | "7-10-years"
  | "10-plus-years";

export interface RoleTenureOption {
  id: RoleTenureOptionId;
  label: string;
}

export interface RoleTenureStepLabels {
  stepTag: string;
  title: string;
  description: string;
  questionLabel: string;
  options: Record<RoleTenureOptionId, string>;
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
  noOngoingJourneyTitle: string;
  noOngoingJourneyMessage: string;
  backToJourneysLink: string;
  errorMessage: string;
  retryButton: string;
}

export interface RoleTenureStepViewModelReturn {
  journeyTitle: string;
  selectedOption: RoleTenureOptionId | null;
  isLoading: boolean;
  /** O usuário não tem jornada em andamento */
  isNotFound: boolean;
  journeysHref: string;
  isSubmitting: boolean;
  isExitModalOpen: boolean;
  error: string | null;
  options: RoleTenureOption[];
  labels: RoleTenureStepLabels;
  handleSelectOption: (id: RoleTenureOptionId) => void;
  handleContinue: () => void;
  handleBack: () => void;
  handleExit: () => void;
  handleCancelExit: () => void;
  handleConfirmExit: () => void;
  handleRetry: () => void;
}
