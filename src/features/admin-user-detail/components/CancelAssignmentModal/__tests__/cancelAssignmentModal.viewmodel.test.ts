import { describe, it, expect, vi } from "vitest";
import { useCancelAssignmentModalVM } from "../cancelAssignmentModal.viewmodel";
import type { CancelAssignmentModalProps } from "../cancelAssignmentModal.types";

describe("useCancelAssignmentModalVM", () => {
  const mockLabels = {
    modalTitle: "Cancelar atribuição de jornada?",
    modalDescription: (title: string) => `Cancelar ${title}?`,
    keepButton: "Manter jornada",
    confirmButton: "Cancelar atribuição",
    cancellingButton: "Cancelando...",
  };

  it("formata título, descrição e repassa handlers", () => {
    const onKeep = vi.fn();
    const onConfirm = vi.fn();
    const props: CancelAssignmentModalProps = {
      isOpen: true,
      journeyTitle: "DPO",
      isCancelling: false,
      errorMessage: "Erro de teste",
      labels: mockLabels,
      onKeep,
      onConfirm,
    };

    const vm = useCancelAssignmentModalVM(props);
    expect(vm.title).toBe("Cancelar atribuição de jornada?");
    expect(vm.description).toBe("Cancelar DPO?");
    expect(vm.keepText).toBe("Manter jornada");
    expect(vm.confirmText).toBe("Cancelar atribuição");
    expect(vm.errorMessage).toBe("Erro de teste");
  });
});
