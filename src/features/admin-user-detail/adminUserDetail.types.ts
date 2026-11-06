import type {
  AdminUserDetails,
  UserCompletedJourney,
  UserRole,
  UserStatus,
  UpdateUserPayload,
} from "@services/usersService";

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
  department?: string;
  employeeCode?: string;
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
}

export interface AdminUserDetailViewModelReturn {
  user: AdminUserDetails | null;
  isLoading: boolean;
  isError: boolean;
  errorMessage: string | null;
  handleRetry: () => void;

  // Header & Status Toggle
  isTogglingStatus: boolean;
  handleToggleStatus: () => void;

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
  handleFieldChange: (field: keyof UserFormValues, value: string) => void;
  handleResetForm: () => void;
  handleSaveForm: () => Promise<void>;

  // Journeys Section
  journeys: UserCompletedJourney[];

  // Delete Modal
  isDeleteModalOpen: boolean;
  isDeleting: boolean;
  handleOpenDeleteModal: () => void;
  handleCloseDeleteModal: () => void;
  handleConfirmDelete: () => Promise<void>;

  labels: AdminUserDetailLabels;
}

export type { AdminUserDetails, UserCompletedJourney, UserRole, UserStatus, UpdateUserPayload };
