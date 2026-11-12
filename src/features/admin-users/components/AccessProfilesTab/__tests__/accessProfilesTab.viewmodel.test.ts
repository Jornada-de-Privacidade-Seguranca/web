import { describe, it, expect } from "vitest";
import { useAccessProfilesTabVM } from "../accessProfilesTab.viewmodel";
import type { AccessProfilesTabProps } from "../accessProfilesTab.types";
import type { AdminUsersLabels } from "../../../adminUsers.types";

describe("useAccessProfilesTabVM", () => {
  const mockLabels: AdminUsersLabels = {
    title: "Usuários",
    subtitle: "Gestão",
    tabUsers: "Usuários",
    tabRoles: "Perfis",
    searchPlaceholder: "Buscar...",
    filterDepartment: "Setor",
    filterAllDepartments: "Todos",
    filterRole: "Perfil",
    filterAllRoles: "Todos",
    filterStatus: "Situação",
    filterAllStatuses: "Todas",
    filterStatusActive: "Ativo",
    filterStatusPending: "Pendente",
    filterStatusInactive: "Inativo",
    filterClear: "Limpar",
    filterCounter: (f, t) => `${f} de ${t}`,
    tableUser: "Usuário",
    tableEmployeeCode: "Código",
    tableDepartment: "Setor",
    tableRole: "Perfil",
    tableStatus: "Situação",
    tableJourneys: "Jornadas",
    tableActions: "Ações",
    tableManage: "Gerenciar",
    rolesTitle: "Perfis de Acesso",
    rolesSubtitle: "Sub",
    rolesDefaultBadge: "Padrão",
    rolesPermissionsTitle: "Permissões",
    rolesHistoryNotice: "Aviso",
    emptyTitle: "Vazio",
    emptyDescription: "Vazio",
    emptyClearButton: "Limpar",
    paginationPrevious: "Anterior",
    paginationNext: "Próxima",
    paginationPageOf: (c, t) => `Página ${c} de ${t}`,
    errorTitle: "Erro",
    errorMessage: "Erro",
    retryButton: "Tentar",
    inviteButton: "Convidar usuário",
    closeMessage: "Fechar aviso",
  };

  it("deve repassar os perfis de acesso e labels", () => {
    const props: AccessProfilesTabProps = {
      profiles: [
        {
          id: "admin",
          name: "Administrador",
          description: "Desc",
          permissions: ["Perm 1"],
        },
      ],
      labels: mockLabels,
      isLoading: false,
    };

    const vm = useAccessProfilesTabVM(props);
    expect(vm.profiles).toHaveLength(1);
    expect(vm.profiles[0].name).toBe("Administrador");
    expect(vm.isLoading).toBe(false);
  });
});
