import type {
  AdminUserListItem,
  UserCompletedJourney,
  UserRole,
  UserStatus,
} from "@features/admin-users/adminUsers.types";
import type {
  JourneyDomain,
  JourneyOrigin,
} from "@features/assessments/assessments.types";

export interface JourneyAssignedBy {
  id: number | string;
  name: string;
}

export interface ActiveJourney {
  id: string;
  profileId: number;
  title: string;
  domain: JourneyDomain;
  domainLabel: string;
  startedAt: string;
  origin: JourneyOrigin;
  assignedBy: JourneyAssignedBy | null;
  assigned_by?: JourneyAssignedBy | null;
}

export interface AssignableJourneyProfile {
  id: number;
  namePt: string;
  nameEn: string;
  domain: JourneyDomain;
}

export interface AssignableJourneyOption {
  id: number;
  name: string;
  domain: JourneyDomain;
  domainLabel: string;
}

export interface AssignJourneyPayload {
  profileId: number;
}

export interface AdminUserDetails extends AdminUserListItem {
  journeys: UserCompletedJourney[];
  activeJourney?: ActiveJourney | null;
  initialJourneyProfileId?: number | null;
}

/** Campos cadastrais editáveis pelo PATCH /users/{user}. */
export type EditableUserField = "name" | "email" | "organization" | "department" | "employeeCode";

/** Só os campos alterados são enviados. */
export type UpdateUserPayload = Partial<Record<EditableUserField, string>>;

export interface UserFormValues {
  name: string;
  organization: string;
  employeeCode: string;
  email: string;
  department: string;
  role: UserRole;
}

export interface UserFormErrors {
  name?: string;
  email?: string;
  organization?: string;
  department?: string;
  employeeCode?: string;
  role?: string;
}

export type DetailMessageVariant = "success" | "destructive";

export interface DetailFeedbackMessage {
  variant: DetailMessageVariant;
  text: string;
}

export interface AdminUserDetailLabels {
  backToList: string;
  statusActive: string;
  statusPending: string;
  statusInactive: string;
  statusActivate: string;
  statusDeactivate: string;
  accountActive: string;
  accountInactive: string;
  accountPending: string;
  toggleSuccess: string;
  bannerTitle: string;
  bannerDescription: string;
  bannerActivateNow: string;
  bannerDismiss: string;
  bannerDontShowAgain: string;
  formTitle: string;
  formSubtitle: string;
  formName: string;
  formOrganization: string;
  formEmployeeCode: string;
  formEmail: string;
  formDepartment: string;
  formRole: string;
  formRoleAdmin: string;
  formRoleManager: string;
  formRoleUser: string;
  formUnsavedChanges: string;
  formCancel: string;
  formSave: string;
  formSaving: string;
  formSaveSuccess: string;
  valNameRequired: string;
  valNameSurname: string;
  valOrganizationRequired: string;
  valMaxLength: (max: number) => string;
  valEmailRequired: string;
  valEmailInvalid: string;
  valDepartmentRequired: string;
  valEmployeeCodeRequired: string;
  journeysTitle: string;
  journeysSubtitle: string;
  journeysViewResult: string;
  journeysViewAllResults: string;
  journeysScore: (score: number) => string;
  journeysCompletedAt: (date: string) => string;
  journeysEmptyTitle: string;
  journeysEmptyDescription: string;
  dangerZoneTitle: string;
  dangerZoneDescription: string;
  dangerZoneDeleteButton: string;
  modalTitle: string;
  modalDescription: (name: string) => string;
  modalCancel: string;
  modalConfirm: string;
  deleteSuccess: string;
  deleting: string;
  loadErrorMessage: string;
  retryButton: string;
  notFoundTitle: string;
  notFoundDescription: string;
  closeMessage: string;
}

export interface ActiveJourneySectionLabels {
  title: string;
  subtitle: string;
  emptyTitle: string;
  emptyDescription: string;
  startedAt: (date: string) => string;
  originSelf: string;
  originAssigned: (name: string) => string;
  assignButton: string;
  alreadyActiveHint: string;
  cancelButton: string;
  closeMessage: string;
  domains: Record<JourneyDomain, string>;
}

export interface AssignJourneyModalLabels {
  modalTitle: string;
  modalDescription: string;
  firstJourneyNotice: string;
  selectionRequiredNotice: string;
  cancel: string;
  confirm: string;
  submitting: string;
  emptyOptions: string;
}

export interface CancelAssignmentModalLabels {
  modalTitle: string;
  modalDescription: (title: string) => string;
  keepButton: string;
  confirmButton: string;
  cancellingButton: string;
}

export interface AdminUserDetailViewModelReturn {
  user: AdminUserDetails | null;
  isLoading: boolean;
  isError: boolean;
  isNotFound: boolean;
  errorMessage: string | null;
  handleRetry: () => void;
  backHref: string;

  // Header & Status Toggle
  isTogglingStatus: boolean;
  handleToggleStatus: () => void;
  statusMessage: DetailFeedbackMessage | null;
  handleDismissStatusMessage: () => void;

  // Inactive User Banner
  showInactiveBanner: boolean;
  handleDismissBanner: () => void;
  handleDontShowAgain: () => void;

  // Form State
  formData: UserFormValues;
  formErrors: UserFormErrors;
  isDirty: boolean;
  isSaving: boolean;
  saveSuccessMessage: string | null;
  saveErrorMessage: string | null;
  handleFieldChange: (field: keyof UserFormValues, value: string) => void;
  handleResetForm: () => void;
  handleSaveForm: () => Promise<void>;

  // Active Journey & Assignment
  activeJourney: ActiveJourney | null;
  assignableOptions: AssignableJourneyOption[];
  isFirstJourney: boolean;
  /** Primeira jornada sem o perfil inicial escolhido: o "Atribuir" fica desabilitado */
  isInitialProfileRequired: boolean;
  selectedProfileId: number | null;
  isAssignModalOpen: boolean;
  isAssigningJourney: boolean;
  assignErrorMessage: string | null;
  isCancelAssignModalOpen: boolean;
  isCancellingAssignment: boolean;
  cancelErrorMessage: string | null;
  journeySuccessMessage: string | null;
  canAssignJourney: boolean;
  canCancelAssignment: boolean;
  handleOpenAssignModal: () => void;
  handleCloseAssignModal: () => void;
  handleSelectProfile: (profileId: number) => void;
  handleConfirmAssignJourney: () => Promise<void>;
  handleOpenCancelAssignModal: () => void;
  handleCloseCancelAssignModal: () => void;
  handleConfirmCancelAssignment: () => Promise<void>;
  handleDismissJourneyMessage: () => void;
  activeJourneyLabels: ActiveJourneySectionLabels;
  assignJourneyLabels: AssignJourneyModalLabels;
  cancelAssignmentLabels: CancelAssignmentModalLabels;

  // Journeys Section
  journeys: UserCompletedJourney[];

  // Delete Modal
  isDeleteModalOpen: boolean;
  isDeleting: boolean;
  deleteErrorMessage: string | null;
  handleOpenDeleteModal: () => void;
  handleCloseDeleteModal: () => void;
  handleConfirmDelete: () => Promise<void>;

  // Permissions
  canDeleteUser: boolean;
  canManageRoles: boolean;
  canManageUser: boolean;
  canToggleStatus: boolean;

  labels: AdminUserDetailLabels;
}

export type {
  JourneyDomain,
  JourneyOrigin,
  UserCompletedJourney,
  UserRole,
  UserStatus,
};
