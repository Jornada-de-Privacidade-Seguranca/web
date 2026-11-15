import { describe, it, expect } from "vitest";
import { useUsersTableVM } from "../usersTable.viewmodel";
import type { UsersTableProps } from "../usersTable.types";
import type { AdminUsersLabels } from "../../../adminUsers.types";

describe("useUsersTableVM", () => {
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
    rolesTitle: "Perfis",
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

  it("deve mapear linhas de usuário com classes de cor por situação e rota de gerenciamento", () => {
    const props: UsersTableProps = {
      users: [
        {
          id: "u1",
          name: "Ana Silva",
          email: "ana@empresa.com",
          initials: "AS",
          employeeCode: "EMP-1",
          department: "TI",
          role: "admin",
          roleLabel: "Administrador",
          status: "active",
          journeysCount: 3,
          organization: "Gov",
          createdAt: "2026-01-01",
        },
        {
          id: "u2",
          name: "Inativo User",
          email: "inativo@empresa.com",
          initials: "IU",
          employeeCode: "EMP-2",
          department: "RH",
          role: "user",
          roleLabel: "Usuário",
          status: "inactive",
          journeysCount: 0,
          organization: "Gov",
          createdAt: "2026-01-01",
        },
      ],
      labels: mockLabels,
    };

    const vm = useUsersTableVM(props);

    expect(vm.rows).toHaveLength(2);
    expect(vm.rows[0].statusLabel).toBe("Ativo");
    expect(vm.rows[0].statusColorClasses).toContain("emerald");
    expect(vm.rows[0].manageHref).toBe("/admin/usuarios/u1");

    expect(vm.rows[1].statusLabel).toBe("Inativo");
    expect(vm.rows[1].statusColorClasses).toContain("muted");
    expect(vm.rows[1].manageHref).toBe("/admin/usuarios/u2");
  });

  it("deve usar fallbacks elegantes (e-mail, traço) quando o usuário é convidado e não tem nome/matrícula/setor", () => {
    const props: UsersTableProps = {
      users: [
        {
          id: "u3",
          name: "",
          email: "convidado@empresa.com",
          initials: "",
          employeeCode: "",
          department: "",
          role: "user",
          roleLabel: "Usuário",
          status: "pending",
          journeysCount: 0,
          organization: "",
          createdAt: "2026-01-01",
        },
      ],
      labels: mockLabels,
    };

    const vm = useUsersTableVM(props);

    expect(vm.rows[0].name).toBe("convidado@empresa.com");
    expect(vm.rows[0].initials).toBe("CO");
    expect(vm.rows[0].employeeCode).toBe("—");
    expect(vm.rows[0].department).toBe("—");
    expect(vm.rows[0].statusLabel).toBe("Pendente");
  });
});
