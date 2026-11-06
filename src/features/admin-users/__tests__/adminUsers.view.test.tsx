// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import { AdminUsersView } from "../index";
import * as viewModelModule from "../adminUsers.viewmodel";
import type { AdminUsersViewModelReturn, AdminUsersLabels } from "../adminUsers.types";
import { AppProviders } from "@/shared/providers";

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
  useLocale: () => "pt",
}));

vi.mock("@/shared/i18n/navigation", () => ({
  Link: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
  usePathname: () => "/admin/usuarios",
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
}));

describe("AdminUsersView", () => {
  beforeEach(() => {
    vi.restoreAllMocks();

    Object.defineProperty(window, "matchMedia", {
      writable: true,
      value: vi.fn().mockImplementation((query) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });

    global.ResizeObserver = class ResizeObserver {
      observe() {}
      unobserve() {}
      disconnect() {}
    };

    if (!window.HTMLElement.prototype.hasPointerCapture) {
      window.HTMLElement.prototype.hasPointerCapture = () => false;
      window.HTMLElement.prototype.setPointerCapture = () => {};
      window.HTMLElement.prototype.releasePointerCapture = () => {};
    }
  });

  const mockLabels: AdminUsersLabels = {
    title: "Gestão de Usuários",
    subtitle: "Encontre colaboradores e gerencie cadastros.",
    tabUsers: "Usuários",
    tabRoles: "Perfis de acesso",
    searchPlaceholder: "Buscar por nome...",
    filterDepartment: "Setor",
    filterAllDepartments: "Todos os setores",
    filterRole: "Perfil de acesso",
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
    rolesTitle: "Perfis de Acesso",
    rolesSubtitle: "Consulte atribuições",
    rolesDefaultBadge: "Padrão",
    rolesPermissionsTitle: "Permissões concedidas:",
    rolesHistoryNotice: "Histórico de auditoria ativo.",
    emptyTitle: "Nenhum usuário encontrado",
    emptyDescription: "Tente ajustar os filtros.",
    emptyClearButton: "Limpar filtros",
    paginationPrevious: "Anterior",
    paginationNext: "Próxima",
    paginationPageOf: (c, t) => `Página ${c} de ${t}`,
    errorTitle: "Erro",
    errorMessage: "Erro ao carregar",
    retryButton: "Tentar novamente",
  };

  function createMockVMReturn(
    overrides?: Partial<AdminUsersViewModelReturn>
  ): AdminUsersViewModelReturn {
    return {
      currentTab: "users",
      handleTabChange: vi.fn(),

      users: [
        {
          id: "u1",
          name: "Ana Silva",
          email: "ana@empresa.com",
          initials: "AS",
          employeeCode: "EMP-1001",
          department: "TI",
          role: "admin",
          roleLabel: "Administrador",
          status: "active",
          journeysCount: 3,
          organization: "Gov",
          createdAt: "2026-01-01",
        },
      ],
      totalUsers: 1,
      filteredTotal: 1,
      page: 1,
      totalPages: 1,
      handlePageChange: vi.fn(),

      isLoading: false,
      isError: false,
      errorMessage: null,
      handleRetry: vi.fn(),

      filters: {
        search: "",
        department: "",
        role: "",
        status: "",
      },
      availableDepartments: ["TI"],
      availableRoles: [{ value: "admin", label: "Administrador" }],
      availableStatuses: [{ value: "active", label: "Ativo" }],
      handleSearchChange: vi.fn(),
      handleDepartmentChange: vi.fn(),
      handleRoleChange: vi.fn(),
      handleStatusChange: vi.fn(),
      handleClearFilters: vi.fn(),
      hasActiveFilters: false,

      accessProfiles: [
        {
          id: "admin",
          name: "Administrador",
          description: "Acesso total",
          permissions: ["Gerenciar tudo"],
        },
      ],
      isProfilesLoading: false,

      labels: mockLabels,
      ...overrides,
    };
  }

  it("deve renderizar a tabela de usuários com dados e botão Gerenciar", () => {
    vi.spyOn(viewModelModule, "useAdminUsersVM").mockReturnValue(
      createMockVMReturn()
    );

    render(
      <AppProviders>
        <AdminUsersView />
      </AppProviders>
    );

    expect(screen.getByText("Gestão de Usuários")).toBeDefined();
    expect(screen.getByText("Ana Silva")).toBeDefined();
    expect(screen.getByText("ana@empresa.com")).toBeDefined();
    expect(screen.getByText("EMP-1001")).toBeDefined();
    expect(screen.getAllByText("Ativo").length).toBeGreaterThanOrEqual(2);

    const manageBtn = screen.getByText("Gerenciar").closest("a");
    expect(manageBtn?.getAttribute("href")).toBe("/admin/usuarios/u1");
  });

  it("deve alternar para a aba Perfis de Acesso ao clicar no trigger correspondente", () => {
    const handleTabChangeMock = vi.fn();
    vi.spyOn(viewModelModule, "useAdminUsersVM").mockReturnValue(
      createMockVMReturn({ handleTabChange: handleTabChangeMock })
    );

    render(
      <AppProviders>
        <AdminUsersView />
      </AppProviders>
    );

    const rolesTab = screen.getByRole("tab", { name: "Perfis de acesso" });
    fireEvent.pointerDown(rolesTab, { button: 0, ctrlKey: false });
    fireEvent.keyDown(rolesTab, { key: "Enter" });
    fireEvent.click(rolesTab);
    expect(handleTabChangeMock).toHaveBeenCalledWith("roles");
  });

  it("deve renderizar a aba de perfis quando currentTab for 'roles'", () => {
    vi.spyOn(viewModelModule, "useAdminUsersVM").mockReturnValue(
      createMockVMReturn({ currentTab: "roles" })
    );

    render(
      <AppProviders>
        <AdminUsersView />
      </AppProviders>
    );

    expect(screen.getByText("Perfis de Acesso")).toBeDefined();
    expect(screen.getByText("Gerenciar tudo")).toBeDefined();
    expect(screen.getByText("Histórico de auditoria ativo.")).toBeDefined();
  });

  it("deve exibir estado vazio quando a lista de usuários estiver vazia", () => {
    vi.spyOn(viewModelModule, "useAdminUsersVM").mockReturnValue(
      createMockVMReturn({ users: [], filteredTotal: 0 })
    );

    render(
      <AppProviders>
        <AdminUsersView />
      </AppProviders>
    );

    expect(screen.getByTestId("users-empty-state")).toBeDefined();
    expect(screen.getByText("Nenhum usuário encontrado")).toBeDefined();
  });
});
