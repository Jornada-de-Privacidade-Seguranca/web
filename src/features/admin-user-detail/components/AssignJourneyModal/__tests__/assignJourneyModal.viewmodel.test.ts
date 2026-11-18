import { describe, it, expect, vi } from "vitest";
import { useAssignJourneyModalVM } from "../assignJourneyModal.viewmodel";
import type { AssignJourneyModalProps } from "../assignJourneyModal.types";

describe("useAssignJourneyModalVM", () => {
  const mockLabels = {
    modalTitle: "Atribuir jornada",
    modalDescription: "Selecione uma opção",
    firstJourneyNotice: "Primeira jornada",
    selectionRequiredNotice: "Usuário precisa escolher o perfil inicial",
    cancel: "Cancelar",
    confirm: "Atribuir",
    submitting: "Atribuindo...",
    emptyOptions: "Nenhum perfil disponível",
  };

  it("calcula canConfirm como verdadeiro apenas quando há perfil selecionado e opções válidas", () => {
    const props: AssignJourneyModalProps = {
      isOpen: true,
      options: [
        {
          id: 1,
          name: "DPO",
          domain: "privacy",
          domainLabel: "Privacidade",
        },
      ],
      isFirstJourney: false,
      isInitialProfileRequired: false,
      selectedProfileId: 1,
      isSubmitting: false,
      errorMessage: null,
      labels: mockLabels,
      onSelectProfile: vi.fn(),
      onCancel: vi.fn(),
      onConfirm: vi.fn(),
    };

    const vm = useAssignJourneyModalVM(props);
    expect(vm.canConfirm).toBe(true);

    const withoutSelection = useAssignJourneyModalVM({
      ...props,
      selectedProfileId: null,
    });
    expect(withoutSelection.canConfirm).toBe(false);

    const emptyOptions = useAssignJourneyModalVM({
      ...props,
      options: [],
    });
    expect(emptyOptions.canConfirm).toBe(false);

    const submitting = useAssignJourneyModalVM({
      ...props,
      isSubmitting: true,
    });
    expect(submitting.canConfirm).toBe(false);

    const initialProfileRequired = useAssignJourneyModalVM({
      ...props,
      isFirstJourney: true,
      isInitialProfileRequired: true,
    });
    expect(initialProfileRequired.canConfirm).toBe(false);
  });
});
