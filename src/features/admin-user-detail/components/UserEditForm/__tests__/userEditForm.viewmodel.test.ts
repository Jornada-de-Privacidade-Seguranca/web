import { describe, it, expect, vi } from "vitest";
import { useUserEditFormVM } from "../userEditForm.viewmodel";
import type { UserEditFormProps } from "../userEditForm.types";
import type { AdminUserDetailLabels } from "../../../adminUserDetail.types";

describe("useUserEditFormVM", () => {
  const mockLabels = {
    formRoleAdmin: "Administrador",
    formRoleManager: "Gestor",
    formRoleUser: "Usuário",
  } as AdminUserDetailLabels;

  it("deve montar as opções de papel e prevenir default no submit", () => {
    const onSaveMock = vi.fn();
    const props: UserEditFormProps = {
      formData: {
        name: "Ana",
        organization: "Gov",
        employeeCode: "EMP-1",
        email: "ana@empresa.com",
        department: "TI",
        role: "admin",
      },
      formErrors: {},
      isDirty: true,
      isSaving: false,
      saveSuccessMessage: null,
      labels: mockLabels,
      onFieldChange: vi.fn(),
      onResetForm: vi.fn(),
      onSaveForm: onSaveMock,
    };

    const vm = useUserEditFormVM(props);

    expect(vm.roleOptions).toHaveLength(3);
    expect(vm.isDirty).toBe(true);

    const preventDefaultMock = vi.fn();
    vm.onSubmit({ preventDefault: preventDefaultMock } as unknown as React.FormEvent);

    expect(preventDefaultMock).toHaveBeenCalled();
    expect(onSaveMock).toHaveBeenCalled();
  });
});
