import type {
  InviteUserPayload,
  InviteUserResponse,
} from "@services/usersService";

export type { InviteUserPayload, InviteUserResponse };

/** Perfil de acesso do convite, vindo de GET /access-profiles. */
export interface InviteRoleOption {
  /** Id do perfil em TB_TIPO_PERFIL. */
  value: number;
  label: string;
}

export interface AdminUserInviteLabels {
  pageTitle: string;
  pageSubtitle: string;
  backToList: string;
  summaryEmptyTitle: string;
  summaryBadge: string;
  formTitle: string;
  formSubtitle: string;
  emailLabel: string;
  emailPlaceholder: string;
  roleLabel: string;
  roleLockedHint: string;
  infoNotice: string;
  cancelButton: string;
  submitButton: string;
  submittingButton: string;
  profilesLoadError: string;
  retryButton: string;
  errors: {
    emailRequired: string;
    emailInvalid: string;
    accountAlreadyExists: string;
    genericSubmit: string;
    permissionDenied: string;
    tooManyAttempts: string;
    validation: string;
  };
}

export interface AdminUserInviteViewModelReturn {
  email: string;
  /** Id do perfil escolhido (Usuário quando não há permissão para trocar). */
  profileTypeId: number;
  summaryTitle: string;
  summaryRoleLabel: string;
  roleOptions: InviteRoleOption[];
  canChangeProfile: boolean;
  isProfilesLoading: boolean;
  isProfilesError: boolean;
  emailError: string | null;
  roleError: string | null;
  submitError: string | null;
  isSubmitting: boolean;
  backHref: string;
  labels: AdminUserInviteLabels;
  handleEmailChange: (value: string) => void;
  handleRoleChange: (profileTypeId: number) => void;
  handleRetryProfiles: () => void;
  handleCancel: () => void;
  handleSubmit: (event: React.FormEvent<HTMLFormElement>) => Promise<void>;
}
