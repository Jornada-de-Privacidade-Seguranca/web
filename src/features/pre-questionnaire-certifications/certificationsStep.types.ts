/** Domínio de conhecimento de uma certificação, como vem do backend. */
export interface CertificationDomainResponse {
  id: number;
  name_pt: string;
  name_en: string;
}

/** Certificação como vem de GET /journeys/current/certifications/options. */
export interface CertificationOptionResponse {
  id: number;
  /** Nome único, exibido igual nos dois idiomas */
  name: string;
  issuer: string | null;
  knowledge_domain: CertificationDomainResponse | null;
}

/** Seleção salva, como vem de GET e PUT /journeys/current/certifications. */
export interface CertificationSelectionResponse {
  journey_id: number;
  status: string;
  is_complete: boolean;
  certifications: CertificationOptionResponse[];
}

export interface SaveCertificationsPayload {
  certification_ids: number[];
}

/** Certificação pronta para a View. */
export interface CertificationItem {
  id: string;
  label: string;
  groupId: string;
}

/** Aba por domínio de conhecimento. */
export interface CertificationGroup {
  id: string;
  label: string;
}

export interface CertificationsStepLabels {
  stepTag: string;
  title: string;
  description: string;
  searchPlaceholder: string;
  searchAriaLabel: string;
  groupsAriaLabel: string;
  emptyLabel: string;
  counterLabel: string;
  limitReachedLabel: string;
  removeCertificationAriaLabel: (certification: string) => string;
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
  retryButton: string;
  noOngoingJourneyTitle: string;
  noOngoingJourneyMessage: string;
  backToJourneysLink: string;
}

export interface CertificationsStepViewModelReturn {
  journeyTitle: string;
  groups: CertificationGroup[];
  activeGroupId: string | undefined;
  visibleCertifications: CertificationItem[];
  selectedCertifications: CertificationItem[];
  searchTerm: string;
  maxSelectable: number;
  isLimitReached: boolean;
  isLoading: boolean;
  isSubmitting: boolean;
  isContinueDisabled: boolean;
  error: string | null;
  isJourneyNotFound: boolean;
  isExitModalOpen: boolean;
  labels: CertificationsStepLabels;
  journeysHref: string;
  handleSearchChange: (term: string) => void;
  handleGroupChange: (id: string) => void;
  handleToggleCertification: (id: string) => void;
  handleRemoveCertification: (id: string) => void;
  handleContinue: () => void;
  handleBack: () => void;
  handleExit: () => void;
  handleCancelExit: () => void;
  handleConfirmExit: () => void;
  handleRetry: () => void;
}
