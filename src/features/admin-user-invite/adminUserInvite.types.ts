import type { UserRole, UserStatus } from "@features/admin-users/adminUsers.types";

export interface InviteUserPayload {
  email: string;
  role: UserRole;
}

export interface InviteUserResponse {
  id: string;
  email: string;
  role: UserRole;
  roleLabel: string;
  status: UserStatus;
  expiresAt: string;
}

export interface InviteRoleOption {
  value: UserRole;
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
  errors: {
    emailRequired: string;
    emailInvalid: string;
    accountAlreadyExists: string;
    genericSubmit: string;
  };
}

export interface AdminUserInviteViewModelReturn {
  email: string;
  role: UserRole;
  summaryTitle: string;
  summaryRoleLabel: string;
  roleOptions: InviteRoleOption[];
  canChangeProfile: boolean;
  emailError: string | null;
  submitError: string | null;
  isSubmitting: boolean;
  labels: AdminUserInviteLabels;
  handleEmailChange: (value: string) => void;
  handleRoleChange: (role: UserRole) => void;
  handleCancel: () => void;
  handleSubmit: (event: React.FormEvent<HTMLFormElement>) => Promise<void>;
}
