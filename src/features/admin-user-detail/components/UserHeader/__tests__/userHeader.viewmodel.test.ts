import { describe, it, expect, vi } from "vitest";
import { useUserHeaderVM } from "../userHeader.viewmodel";
import type { UserHeaderProps } from "../userHeader.types";
import type { AdminUserDetailLabels } from "../../../adminUserDetail.types";

describe("useUserHeaderVM", () => {
  const mockLabels: AdminUserDetailLabels = {
    backToList: "Voltar",
    statusActive: "Ativo",
    statusPending: "Pendente",
    statusInactive: "Inativo",
    statusActivate: "Ativar conta",
    statusDeactivate: "Desativar conta",
    accountActive: "Conta ativa",
    accountInactive: "Conta inativa",
    accountPending: "Conta pendente",
    toggleSuccess: "Sucesso",
    bannerTitle: "Aviso",
    bannerDescription: "Desc",
    bannerActivateNow: "Ativar agora",
    bannerDismiss: "Fechar",
    bannerDontShowAgain: "Não mostrar",
    formTitle: "Dados",
    formSubtitle: "Sub",
    formName: "Nome",
    formOrganization: "Órgão",
    formEmployeeCode: "Código",
    formEmail: "Email",
    formDepartment: "Setor",
    formRole: "Perfil",
    formRoleAdmin: "Admin",
    formRoleManager: "Gestor",
    formRoleUser: "Usuário",
    formUnsavedChanges: "Não salvo",
    formCancel: "Cancelar",
    formSave: "Salvar",
    formSaving: "Salvando...",
    formSaveSuccess: "Salvo!",
    valNameRequired: "Nome obrigatório",
    valEmailRequired: "Email obrigatório",
    valEmailInvalid: "Email inválido",
    valDepartmentRequired: "Setor obrigatório",
    valEmployeeCodeRequired: "Código obrigatório",
    journeysTitle: "Jornadas",
    journeysSubtitle: "Sub",
    journeysViewResult: "Ver",
    journeysViewAllResults: "Ver todos",
    journeysScore: (s) => `Nota: ${s}`,
    journeysCompletedAt: (d) => `Concluída em ${d}`,
    journeysEmptyTitle: "Vazio",
    journeysEmptyDescription: "Vazio desc",
    dangerZoneTitle: "Perigo",
    dangerZoneDescription: "Desc perigo",
    dangerZoneDeleteButton: "Excluir",
    modalTitle: "Confirmar",
    modalDescription: (n) => `Excluir ${n}`,
    modalCancel: "Cancelar",
    modalConfirm: "Sim",
    deleteSuccess: "Excluído",
  };

  it("deve computar textos e status corretos para usuário ativo", () => {
    const onToggleMock = vi.fn();
    const props: UserHeaderProps = {
      user: {
        id: "1",
        name: "Carlos",
        email: "c@e.com",
        initials: "CS",
        employeeCode: "EMP-1",
        department: "TI",
        organization: "Gov",
        role: "admin",
        roleLabel: "Administrador",
        status: "active",
        journeysCount: 2,
        createdAt: "2026-01-01",
        journeys: [],
      },
      labels: mockLabels,
      isTogglingStatus: false,
      onToggleStatus: onToggleMock,
    };

    const vm = useUserHeaderVM(props);

    expect(vm.name).toBe("Carlos");
    expect(vm.isActive).toBe(true);
    expect(vm.statusLabel).toBe("Conta ativa");
    expect(vm.statusToggleText).toBe("Desativar conta");

    vm.onToggleStatus();
    expect(onToggleMock).toHaveBeenCalled();
  });

  it("deve computar statusToggleText como Ativar conta para usuário inativo", () => {
    const props: UserHeaderProps = {
      user: {
        id: "2",
        name: "Inativo",
        email: "i@e.com",
        initials: "IN",
        employeeCode: "EMP-2",
        department: "RH",
        organization: "Gov",
        role: "user",
        roleLabel: "Usuário",
        status: "inactive",
        journeysCount: 0,
        createdAt: "2026-01-01",
        journeys: [],
      },
      labels: mockLabels,
      isTogglingStatus: false,
      onToggleStatus: vi.fn(),
    };

    const vm = useUserHeaderVM(props);
    expect(vm.isActive).toBe(false);
    expect(vm.statusLabel).toBe("Conta inativa");
    expect(vm.statusToggleText).toBe("Ativar conta");
  });
});
