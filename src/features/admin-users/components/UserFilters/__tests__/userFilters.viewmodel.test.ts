import { describe, it, expect, vi } from "vitest";
import { useUserFiltersVM } from "../userFilters.viewmodel";
import type { UserFiltersProps } from "../userFilters.types";
import type { AdminUsersLabels } from "../../../adminUsers.types";

describe("useUserFiltersVM", () => {
  const mockLabels: AdminUsersLabels = {
    title: "Usuários",
    subtitle: "Gestão",
    tabUsers: "Usuários",
    tabRoles: "Perfis",
    searchPlaceholder: "Buscar...",
    filterDepartment: "Setor",
    filterAllDepartments: "Todos os setores",
    filterRole: "Perfil",
    filterAllRoles: "Todos os perfis",
    filterStatus: "Situação",
    filterAllStatuses: "Todas as situações",
    filterStatusActive: "Ativo",
    filterStatusPending: "Pendente",
    filterStatusInactive: "Inativo",
    filterClear: "Limpar filtros",
    filterCounter: (f, t) => `Mostrando ${f} de ${t} usuários`,
    tableUser: "Usuário",
    tableEmployeeCode: "Código",
    tableDepartment: "Setor",
    tableRole: "Perfil",
    tableStatus: "Situação",
    tableJourneys: "Jornadas",
    tableActions: "Ações",
    tableManage: "Gerenciar",
    rolesTitle: "Perfis",
    rolesSubtitle: "Sub",
    rolesDefaultBadge: "Padrão",
    rolesPermissionsTitle: "Permissões",
    rolesHistoryNotice: "Aviso",
    emptyTitle: "Vazio",
    emptyDescription: "Vazio desc",
    emptyClearButton: "Limpar",
    paginationPrevious: "Anterior",
    paginationNext: "Próxima",
    paginationPageOf: (c, t) => `Página ${c} de ${t}`,
    errorTitle: "Erro",
    errorMessage: "Erro desc",
    profilesErrorMessage: "Erro perfis",
    retryButton: "Tentar",
    inviteButton: "Convidar usuário",
    closeMessage: "Fechar aviso",
  };

  it("deve montar o retorno do hook com os valores e contadores corretos", () => {
    const onSearchChangeMock = vi.fn();
    const onDepartmentChangeMock = vi.fn();
    const onRoleChangeMock = vi.fn();
    const onStatusChangeMock = vi.fn();
    const onClearFiltersMock = vi.fn();

    const props: UserFiltersProps = {
      filters: {
        search: "Ana",
        department: "TI",
        role: "admin",
        status: "active",
      },
      availableDepartments: ["TI", "Jurídico"],
      availableRoles: [{ value: "admin", label: "Admin" }],
      availableStatuses: [{ value: "active", label: "Ativo" }],
      filteredTotal: 1,
      totalUsers: 10,
      hasActiveFilters: true,
      onSearchChange: onSearchChangeMock,
      onDepartmentChange: onDepartmentChangeMock,
      onRoleChange: onRoleChangeMock,
      onStatusChange: onStatusChangeMock,
      onClearFilters: onClearFiltersMock,
      labels: mockLabels,
    };

    const vm = useUserFiltersVM(props);

    expect(vm.search).toBe("Ana");
    expect(vm.department).toBe("TI");
    expect(vm.role).toBe("admin");
    expect(vm.status).toBe("active");
    expect(vm.counterText).toBe("Mostrando 1 de 10 usuários");
    expect(vm.hasActiveFilters).toBe(true);

    vm.onSearchChange("Carlos");
    expect(onSearchChangeMock).toHaveBeenCalledWith("Carlos");

    vm.onClearFilters();
    expect(onClearFiltersMock).toHaveBeenCalled();
  });
});
