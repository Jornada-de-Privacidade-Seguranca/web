import { describe, it, expect, vi } from "vitest";
import { useDeleteUserModalVM } from "../deleteUserModal.viewmodel";
import type { DeleteUserModalProps } from "../deleteUserModal.types";
import type { AdminUserDetailLabels } from "../../../adminUserDetail.types";

describe("useDeleteUserModalVM", () => {
  const mockLabels = {
    modalTitle: "Excluir usuário permanentemente?",
    modalDescription: (name: string) => `Tem certeza de que deseja excluir ${name}?`,
    modalCancel: "Cancelar",
    modalConfirm: "Sim, excluir",
  } as AdminUserDetailLabels;

  it("deve computar textos e ações de confirmação de exclusão", () => {
    const onCancelMock = vi.fn();
    const onConfirmMock = vi.fn();

    const props: DeleteUserModalProps = {
      isOpen: true,
      userName: "Carlos Santos",
      isDeleting: false,
      labels: mockLabels,
      onCancel: onCancelMock,
      onConfirm: onConfirmMock,
    };

    const vm = useDeleteUserModalVM(props);

    expect(vm.isOpen).toBe(true);
    expect(vm.description).toContain("Carlos Santos");

    vm.onCancel();
    expect(onCancelMock).toHaveBeenCalled();

    vm.onConfirm();
    expect(onConfirmMock).toHaveBeenCalled();
  });
});
