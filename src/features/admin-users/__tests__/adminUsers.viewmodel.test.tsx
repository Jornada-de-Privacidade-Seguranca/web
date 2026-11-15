// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import React from "react";
import * as usersService from "@services/usersService";
import { useAuthStore } from "@features/auth/auth.store";
import { useAdminUsersStore } from "../adminUsers.store";
import { useAdminUsersVM } from "../adminUsers.viewmodel";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string, params?: Record<string, unknown>) => {
    if (key === "filters.counter")
      return `Mostrando ${params?.filtered} de ${params?.total} usuários`;
    if (key === "pagination.pageOf")
      return `Página ${params?.current} de ${params?.total}`;
    if (key === "inviteSuccess")
      return `Convite enviado para ${params?.email}`;
    return key;
  },
}));

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });
  function Wrapper({ children }: { children: React.ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  }
  return Wrapper;
}

describe("useAdminUsersVM", () => {
  const mockPaginatedUsers = {
    items: [
      {
        id: "1",
        name: "Ana Silva",
        email: "ana@empresa.com",
        initials: "AS",
        employeeCode: "EMP-1001",
        department: "TI",
        role: "admin" as const,
        roleLabel: "Administrador",
        status: "active" as const,
        journeysCount: 4,
        organization: "Gov",
        createdAt: "2026-01-01",
      },
    ],
    total: 10,
    filteredTotal: 1,
    page: 1,
    limit: 6,
    totalPages: 2,
  };

  const mockProfiles = [
    {
      id: "admin" as const,
      name: "Administrador",
      description: "Acesso total",
      permissions: ["Tudo"],
    },
  ];

  beforeEach(() => {
    vi.restoreAllMocks();
    useAdminUsersStore.getState().clearInvitedEmail();
    useAuthStore.getState().clearAuth();
  });

  it("deve carregar inicialmente a listagem e os perfis", async () => {
    vi.spyOn(usersService, "getUsersList").mockResolvedValue(mockPaginatedUsers);
    vi.spyOn(usersService, "getAccessProfiles").mockResolvedValue(mockProfiles);

    const { result } = renderHook(() => useAdminUsersVM(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.users).toHaveLength(1);
    expect(result.current.totalUsers).toBe(10);
    expect(result.current.filteredTotal).toBe(1);
    expect(result.current.currentTab).toBe("users");
  });

  it("deve alternar entre abas", () => {
    const { result } = renderHook(() => useAdminUsersVM(), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.handleTabChange("roles");
    });
    expect(result.current.currentTab).toBe("roles");

    act(() => {
      result.current.handleTabChange("users");
    });
    expect(result.current.currentTab).toBe("users");
  });

  it("deve atualizar filtros de busca, departamento, perfil e situação e resetar página", async () => {
    vi.spyOn(usersService, "getUsersList").mockResolvedValue(mockPaginatedUsers);

    const { result } = renderHook(() => useAdminUsersVM(), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.handlePageChange(2);
    });
    expect(result.current.page).toBe(2);

    act(() => {
      result.current.handleDepartmentChange("Jurídico");
    });
    expect(result.current.filters.department).toBe("Jurídico");
    expect(result.current.page).toBe(1);
    expect(result.current.hasActiveFilters).toBe(true);

    act(() => {
      result.current.handleRoleChange("manager");
      result.current.handleStatusChange("active");
    });
    expect(result.current.filters.role).toBe("manager");
    expect(result.current.filters.status).toBe("active");

    act(() => {
      result.current.handleClearFilters();
    });
    expect(result.current.filters.department).toBe("");
    expect(result.current.filters.role).toBe("");
    expect(result.current.filters.status).toBe("");
    expect(result.current.hasActiveFilters).toBe(false);
  });

  it("controla canInviteUsers pela permissão users.register e exibe alerta de convite via store em memória", () => {
    useAdminUsersStore.getState().setInvitedEmail("novo@empresa.com");
    useAuthStore.getState().setAuth({
      id: 1,
      name: "Admin",
      email: "admin@empresa.com",
      role: "administrator",
      permissions: ["users.view", "users.register"],
      profile: {
        id: "admin",
        name: "Administrador",
        label: "Administrador",
        role: "administrator",
        user_type_id: 1,
        profile_type_id: 1,
        profile_type_name: "Administrador",
        permissions: ["users.view", "users.register"],
      },
      active_status: 1,
    });

    const { result, rerender } = renderHook(() => useAdminUsersVM(), {
      wrapper: createWrapper(),
    });

    expect(result.current.canInviteUsers).toBe(true);
    expect(result.current.inviteSuccessMessage).toBe(
      "Convite enviado para novo@empresa.com"
    );

    act(() => {
      result.current.handleDismissInviteMessage();
    });
    expect(result.current.inviteSuccessMessage).toBeNull();

    act(() => {
      useAuthStore.getState().setAuth({
        id: 2,
        name: "Gestor",
        email: "gestor@empresa.com",
        role: "common_user",
        permissions: ["users.view", "results.view_all"],
        profile: {
          id: "manager",
          name: "Gestor",
          label: "Gestor",
          role: "common_user",
          user_type_id: 2,
          profile_type_id: 2,
          profile_type_name: "Gestor",
          permissions: ["users.view", "results.view_all"],
        },
        active_status: 1,
      });
    });

    rerender();
    expect(result.current.canInviteUsers).toBe(false);
  });
});
