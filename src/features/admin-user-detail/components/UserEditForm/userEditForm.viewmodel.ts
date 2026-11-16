import type {
  UserEditFormProps,
  UserEditFormViewModelReturn,
  RoleSelectOption,
} from "./userEditForm.types";

export function useUserEditFormVM(
  props: UserEditFormProps
): UserEditFormViewModelReturn {
  const {
    formData,
    formErrors,
    isDirty,
    isSaving,
    saveSuccessMessage,
    labels,
    onFieldChange,
    onResetForm,
    onSaveForm,
  } = props;

  const roleOptions: RoleSelectOption[] = [
    { value: "admin", label: labels.formRoleAdmin },
    { value: "manager", label: labels.formRoleManager },
    { value: "user", label: labels.formRoleUser },
  ];

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    void onSaveForm();
  };

  return {
    formData,
    formErrors,
    isDirty,
    isSaving,
    saveSuccessMessage,
    saveErrorMessage: props.saveErrorMessage ?? null,
    labels,
    roleOptions,
    onFieldChange,
    onResetForm,
    onSubmit,
    canManageRoles: props.canManageRoles ?? true,
    canManageUser: props.canManageUser ?? true,
  };
}
