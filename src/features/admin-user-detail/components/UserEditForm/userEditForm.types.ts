import type {
  UserFormValues,
  UserFormErrors,
  AdminUserDetailLabels,
  UserRole,
} from "../../adminUserDetail.types";

export interface UserEditFormProps {
  formData: UserFormValues;
  formErrors: UserFormErrors;
  isDirty: boolean;
  isSaving: boolean;
  saveSuccessMessage: string | null;
  saveErrorMessage?: string | null;
  labels: AdminUserDetailLabels;
  canManageRoles?: boolean;
  canManageUser?: boolean;
  onFieldChange: (field: keyof UserFormValues, value: string) => void;
  onResetForm: () => void;
  onSaveForm: () => Promise<void>;
}

export interface RoleSelectOption {
  value: UserRole;
  label: string;
}

export interface UserEditFormViewModelReturn {
  formData: UserFormValues;
  formErrors: UserFormErrors;
  isDirty: boolean;
  isSaving: boolean;
  saveSuccessMessage: string | null;
  saveErrorMessage: string | null;
  labels: AdminUserDetailLabels;
  roleOptions: RoleSelectOption[];
  canManageRoles: boolean;
  canManageUser: boolean;
  onFieldChange: (field: keyof UserFormValues, value: string) => void;
  onResetForm: () => void;
  onSubmit: (e: React.FormEvent) => void;
}
