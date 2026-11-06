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
  labels: AdminUserDetailLabels;
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
  labels: AdminUserDetailLabels;
  roleOptions: RoleSelectOption[];
  onFieldChange: (field: keyof UserFormValues, value: string) => void;
  onResetForm: () => void;
  onSubmit: (e: React.FormEvent) => void;
}
