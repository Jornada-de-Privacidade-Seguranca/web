// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import React from "react";
import * as usersService from "@services/usersService";
import { useAuthStore } from "@features/auth/auth.store";
import { useAdminUsersStore } from "../adminUsers.store";
import { useAdminUsersVM } from "../adminUsers.viewmodel";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

/** URL simulada: o router.replace atualiza a query e o useSearchParams re-renderiza. */
const nav = vi.hoisted(() => {
  let query = "";
  const listeners = new Set<() => void>();
  return {
    get: () => query,
    set: (next: string) => {
      query = next;
      listeners.forEach((listener) => listener());
    },
    subscribe: (listener: () => void) => {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    replace: vi.fn(),
  };
});

vi.mock("next/navigation", async () => {
  const ReactModule = await import("react");
  return {
    useSearchParams: () => {
      const query = ReactModule.useSyncExternalStore(nav.subscribe, nav.get, nav.get);
      return ReactModule.useMemo(() => new URLSearchParams(query), [query]);
    },
  };
});

vi.mock("@/shared/i18n/navigation", () => ({
  usePathname: () => "/admin/usuarios",
  useRouter: () => ({
    replace: (href: string, options?: unknown) => {
      nav.replace(href, options);
      nav.set(href.split("?")[1] ?? "");
    },
  }),
}));

vi.mock("next-intl", () => ({
  useLocale: () => "pt",
  useTranslations: () => (key: string, params?: Record<string, unknown>) => {
    if (key === "filters.counter")
      return `Mostrando ${params?.filtered} de ${params?.total} usuários`;
    if (key === "pagination.pageOf")
      return `Página ${params?.current} de ${params?.total}`;
    if (key === "inviteSuccess")
      return `Convite enviado para ${params?.email}`;
    if (key === "deleteSuccess")
      return `Usuário ${params?.name} excluído`;
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
        profileTypeId: 1,
        roleLabel: "Administrador",
        status: "active" as const,
        journeysCount: 4,
        organization: "Gov",
        createdAt: "2026-01-01",
      },
    ],
    total: 1,
    page: 1,
    perPage: 10,
    totalPages: 2,
  };

  const mockProfiles = [
    {
      id: 1,
      role: "admin" as const,
      name: "Administrador",
      description: "",
      permissions: ["Tudo"],
    },
    {
      id: 2,
      role: "manager" as const,
      name: "Gestor",
      description: "",
      permissions: ["Atribuir jornadas"],
    },
    {
      id: 9,
      role: null,
      name: "Auditor",
      description: "",
      permissions: [],
    },
  ];

  beforeEach(() => {
    vi.restoreAllMocks();
    nav.set("");
    nav.replace.mockClear();
    vi.spyOn(usersService, "getUserDepartments").mockResolvedValue(["TI", "Jurídico"]);
    useAdminUsersStore.getState().clearInvitedEmail();
    useAdminUsersStore.getState().clearDeletedUserName();
    useAuthStore.getState().clearAuth();
  });

  it("deve carregar inicialmente a listagem, os setores e os perfis", async () => {
    const listSpy = vi.spyOn(usersService, "getUsersList").mockResolvedValue(mockPaginatedUsers);
    const profilesSpy = vi
      .spyOn(usersService, "getAccessProfiles")
      .mockResolvedValue(mockProfiles);

    const { result } = renderHook(() => useAdminUsersVM(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
      expect(result.current.availableDepartments).toEqual(["TI", "Jurídico"]);
    });

    expect(listSpy).toHaveBeenCalledWith({
      page: 1,
      perPage: 10,
      search: "",
      department: "",
      role: "",
      status: "",
    });
    expect(profilesSpy).toHaveBeenCalledWith("pt");
    expect(result.current.users).toHaveLength(1);
    // Sem filtros, o total geral é o próprio total da consulta
    expect(result.current.totalUsers).toBe(1);
    expect(result.current.filteredTotal).toBe(1);
    expect(result.current.currentTab).toBe("users");
    await waitFor(() => expect(result.current.accessProfiles).toHaveLength(3));
    expect(result.current.accessProfiles.map((p) => p.description)).toEqual([
      "rolesTab.descriptions.admin",
      "rolesTab.descriptions.manager",
      "",
    ]);
  });

  it("lê a busca, os filtros e a página da URL e envia à API", async () => {
    nav.set("search=ana&department=TI&role=manager&status=pending&page=3");
    const listSpy = vi.spyOn(usersService, "getUsersList").mockImplementation(async (params) =>
      params?.perPage === 1
        ? { ...mockPaginatedUsers, items: [], total: 40 }
        : { ...mockPaginatedUsers, total: 5 }
    );
    vi.spyOn(usersService, "getAccessProfiles").mockResolvedValue([]);

    const { result } = renderHook(() => useAdminUsersVM(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.totalUsers).toBe(40);
    });

    expect(listSpy).toHaveBeenCalledWith({
      page: 3,
      perPage: 10,
      search: "ana",
      department: "TI",
      role: "manager",
      status: "pending",
    });
    expect(result.current.filters).toEqual({
      search: "ana",
      department: "TI",
      role: "manager",
      status: "pending",
    });
    expect(result.current.page).toBe(3);
    expect(result.current.filteredTotal).toBe(5);
    expect(result.current.hasActiveFilters).toBe(true);
    // A query string fica no store para o "Voltar" do detalhe
    expect(useAdminUsersStore.getState().listQuery).toBe(
      "search=ana&department=TI&role=manager&status=pending&page=3"
    );
  });

  it("ignora valores inválidos de perfil, situação e página na URL", async () => {
    nav.set("role=root&status=deleted&page=-2");
    const listSpy = vi.spyOn(usersService, "getUsersList").mockResolvedValue(mockPaginatedUsers);
    vi.spyOn(usersService, "getAccessProfiles").mockResolvedValue([]);

    renderHook(() => useAdminUsersVM(), { wrapper: createWrapper() });

    await waitFor(() => expect(listSpy).toHaveBeenCalled());
    expect(listSpy).toHaveBeenCalledWith(
      expect.objectContaining({ page: 1, role: "", status: "" })
    );
  });

  it("espera a pausa na digitação antes de levar a busca à URL", async () => {
    vi.useFakeTimers();
    try {
      vi.spyOn(usersService, "getUsersList").mockResolvedValue(mockPaginatedUsers);
      vi.spyOn(usersService, "getAccessProfiles").mockResolvedValue([]);
      nav.set("page=2");

      const { result } = renderHook(() => useAdminUsersVM(), {
        wrapper: createWrapper(),
      });

      act(() => {
        result.current.handleSearchChange("ma");
      });
      act(() => {
        result.current.handleSearchChange("maria ");
      });
      expect(result.current.filters.search).toBe("maria ");
      expect(nav.replace).not.toHaveBeenCalled();

      act(() => {
        vi.advanceTimersByTime(400);
      });

      expect(nav.replace).toHaveBeenCalledTimes(1);
      expect(nav.replace).toHaveBeenCalledWith("/admin/usuarios?search=maria", { scroll: false });
      expect(result.current.page).toBe(1);
      expect(result.current.filters.search).toBe("maria ");
    } finally {
      vi.useRealTimers();
    }
  });

  it("mostra o aviso de exclusão vindo do detalhe", () => {
    useAdminUsersStore.getState().setDeletedUserName("Maria Silva");
    vi.spyOn(usersService, "getUsersList").mockResolvedValue(mockPaginatedUsers);
    vi.spyOn(usersService, "getAccessProfiles").mockResolvedValue([]);

    const { result } = renderHook(() => useAdminUsersVM(), {
      wrapper: createWrapper(),
    });

    expect(result.current.deleteSuccessMessage).toBe("Usuário Maria Silva excluído");
    act(() => {
      result.current.handleDismissDeleteMessage();
    });
    expect(result.current.deleteSuccessMessage).toBeNull();
  });

  it("mantém os avisos de convite e exclusão no StrictMode e os tira do store", () => {
    useAdminUsersStore.getState().setInvitedEmail("novo@empresa.com");
    useAdminUsersStore.getState().setDeletedUserName("Maria Silva");
    vi.spyOn(usersService, "getUsersList").mockResolvedValue(mockPaginatedUsers);
    vi.spyOn(usersService, "getAccessProfiles").mockResolvedValue([]);
    const Wrapper = createWrapper();

    const { result } = renderHook(() => useAdminUsersVM(), {
      wrapper: ({ children }) => (
        <React.StrictMode>
          <Wrapper>{children}</Wrapper>
        </React.StrictMode>
      ),
    });

    expect(result.current.inviteSuccessMessage).toBe("Convite enviado para novo@empresa.com");
    expect(result.current.deleteSuccessMessage).toBe("Usuário Maria Silva excluído");
    // Saem do store: voltar à listagem depois não repete o aviso
    expect(useAdminUsersStore.getState().invitedEmail).toBeNull();
    expect(useAdminUsersStore.getState().deletedUserName).toBeNull();
  });

  it("expõe o erro da listagem e dos perfis com nova tentativa", async () => {
    const listSpy = vi
      .spyOn(usersService, "getUsersList")
      .mockRejectedValueOnce(new Error("falhou"))
      .mockResolvedValue(mockPaginatedUsers);
    const profilesSpy = vi
      .spyOn(usersService, "getAccessProfiles")
      .mockRejectedValueOnce(new Error("falhou"))
      .mockResolvedValue(mockProfiles);

    const { result } = renderHook(() => useAdminUsersVM(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
      expect(result.current.isProfilesError).toBe(true);
    });
    expect(result.current.errorMessage).toBe("error.message");

    act(() => {
      result.current.handleRetry();
      result.current.handleRetryProfiles();
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(false);
      expect(result.current.isProfilesError).toBe(false);
    });
    expect(listSpy).toHaveBeenCalledTimes(2);
    expect(profilesSpy).toHaveBeenCalledTimes(2);
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

  it("deve levar setor, perfil, situação e página à URL e resetar a página ao filtrar", async () => {
    vi.spyOn(usersService, "getUsersList").mockResolvedValue(mockPaginatedUsers);

    const { result } = renderHook(() => useAdminUsersVM(), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.handlePageChange(2);
    });
    expect(result.current.page).toBe(2);
    expect(nav.replace).toHaveBeenLastCalledWith("/admin/usuarios?page=2", { scroll: false });

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
    expect(nav.get()).toBe("department=Jur%C3%ADdico&role=manager&status=active");

    act(() => {
      result.current.handleClearFilters();
    });
    expect(nav.replace).toHaveBeenLastCalledWith("/admin/usuarios", { scroll: false });
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
