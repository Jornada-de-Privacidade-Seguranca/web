/** Nível de formação de um curso, como vem do backend (subcritério). */
export interface CourseTypeResponse {
  id: number;
  name_pt: string;
  name_en: string;
}

/** Curso como vem de GET /journeys/current/courses e /courses/options. */
export interface CourseOptionResponse {
  id: number;
  name_pt: string;
  name_en: string;
  type: CourseTypeResponse | null;
}

export interface SaveCoursesPayload {
  course_ids: number[];
}

/** Curso já no idioma atual, pronto para a View. */
export interface CourseItem {
  id: string;
  label: string;
  groupId: string;
}

/** Aba de nível de formação. */
export interface CourseGroup {
  id: string;
  label: string;
}

export interface AcademicStepLabels {
  stepTag: string;
  title: string;
  description: string;
  searchPlaceholder: string;
  searchAriaLabel: string;
  groupsAriaLabel: string;
  emptyLabel: string;
  counterLabel: string;
  removeCourseAriaLabel: (course: string) => string;
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

export interface AcademicStepViewModelReturn {
  journeyTitle: string;
  groups: CourseGroup[];
  activeGroupId: string | undefined;
  visibleCourses: CourseItem[];
  selectedCourses: CourseItem[];
  searchTerm: string;
  isLoading: boolean;
  isSubmitting: boolean;
  isContinueDisabled: boolean;
  error: string | null;
  isJourneyNotFound: boolean;
  isExitModalOpen: boolean;
  labels: AcademicStepLabels;
  journeysHref: string;
  handleSearchChange: (term: string) => void;
  handleGroupChange: (id: string) => void;
  handleToggleCourse: (id: string) => void;
  handleRemoveCourse: (id: string) => void;
  handleContinue: () => void;
  handleBack: () => void;
  handleExit: () => void;
  handleCancelExit: () => void;
  handleConfirmExit: () => void;
  handleRetry: () => void;
}
