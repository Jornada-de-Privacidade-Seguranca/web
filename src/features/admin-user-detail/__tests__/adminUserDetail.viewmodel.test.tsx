// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import React from "react";
import * as usersService from "@services/usersService";
import { useAuthStore } from "@features/auth/auth.store";
import { useAdminUserDetailVM } from "../adminUserDetail.viewmodel";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const pushMock = vi.fn();
vi.mock("@/shared/i18n/navigation", () => ({
  useRouter: () => ({
    push: pushMock,
    replace: vi.fn(),
  }),
}));

vi.mock("next-intl", () => ({
  useLocale: () => "pt",
  useTranslations: () => (key: string, params?: Record<string, unknown>) => {
    if (key === "dangerZone.modalDescription")
      return `Excluir ${params?.name}`;
    if (key === "journeys.completedAt")
      return `Concluída em ${params?.date}`;
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

describe("useAdminUserDetailVM", () => {
  const mockUser: usersService.AdminUserDetails = {
    id: "1",
    name: "Ana Silva",
    email: "ana@empresa.com",
    initials: "AS",
    employeeCode: "EMP-1001",
    department: "TI",
    organization: "Secretaria de Governo",
    role: "admin",
    roleLabel: "Administrador",
    status: "inactive",
    journeysCount: 1,
    createdAt: "2026-01-01",
    journeys: [
      {
        id: "j1",
        title: "Encarregado pelo Tratamento de Dados Pessoais",
        domain: "privacy",
        domainLabel: "Privacidade",
        completedAt: "2026-03-01",
        score: 85,
      },
    ],
  };

  beforeEach(() => {
    vi.restoreAllMocks();
    window.localStorage.clear();
    useAuthStore.getState().setAuth({
      id: 1,
      name: "Admin Logado",
      email: "admin@empresa.com",
      role: "administrator",
      permissions: ["users.view", "users.manage", "journeys.assign"],
      profile: {
        id: "admin",
        name: "Administrador",
        label: "Administrador",
        role: "administrator",
        user_type_id: 1,
        profile_type_id: 1,
        profile_type_name: "Administrador",
        permissions: ["users.view", "users.manage", "journeys.assign"],
      },
      active_status: 1,
    });
  });

  it("deve carregar os dados do usuário e inicializar o formulário", async () => {
    vi.spyOn(usersService, "getUserById").mockResolvedValue(mockUser);

    const { result } = renderHook(() => useAdminUserDetailVM({ userId: "1" }), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.user?.name).toBe("Ana Silva");
    expect(result.current.formData.name).toBe("Ana Silva");
    expect(result.current.isDirty).toBe(false);
    expect(result.current.showInactiveBanner).toBe(true);
  });

  it("deve detectar alterações não salvas (isDirty) e permitir resetar o formulário", async () => {
    vi.spyOn(usersService, "getUserById").mockResolvedValue(mockUser);

    const { result } = renderHook(() => useAdminUserDetailVM({ userId: "1" }), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    act(() => {
      result.current.handleFieldChange("name", "Ana Silva Modificada");
    });

    expect(result.current.formData.name).toBe("Ana Silva Modificada");
    expect(result.current.isDirty).toBe(true);

    act(() => {
      result.current.handleResetForm();
    });

    expect(result.current.formData.name).toBe("Ana Silva");
    expect(result.current.isDirty).toBe(false);
  });

  it("deve validar campos obrigatórios e formato de email antes de salvar", async () => {
    vi.spyOn(usersService, "getUserById").mockResolvedValue(mockUser);

    const { result } = renderHook(() => useAdminUserDetailVM({ userId: "1" }), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    act(() => {
      result.current.handleFieldChange("name", "");
      result.current.handleFieldChange("email", "email-invalido");
    });

    await act(async () => {
      await result.current.handleSaveForm();
    });

    expect(result.current.formErrors.name).toBeDefined();
    expect(result.current.formErrors.email).toBeDefined();
  });

  it("deve salvar alterações com sucesso", async () => {
    vi.spyOn(usersService, "getUserById").mockResolvedValue(mockUser);
    const updateSpy = vi.spyOn(usersService, "updateUser").mockResolvedValue({
      ...mockUser,
      name: "Ana Silva Atualizada",
    });

    const { result } = renderHook(() => useAdminUserDetailVM({ userId: "1" }), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    act(() => {
      result.current.handleFieldChange("name", "Ana Silva Atualizada");
    });

    await act(async () => {
      await result.current.handleSaveForm();
    });

    expect(updateSpy).toHaveBeenCalledWith("1", expect.objectContaining({ name: "Ana Silva Atualizada" }));
    expect(result.current.saveSuccessMessage).toBeDefined();
  });

  it("deve alternar a ativação da conta", async () => {
    vi.spyOn(usersService, "getUserById").mockResolvedValue(mockUser);
    const toggleSpy = vi.spyOn(usersService, "toggleUserStatus").mockResolvedValue({
      ...mockUser,
      status: "active",
    });

    const { result } = renderHook(() => useAdminUserDetailVM({ userId: "1" }), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    await act(async () => {
      await result.current.handleToggleStatus();
    });

    expect(toggleSpy).toHaveBeenCalledWith("1", "active");
  });

  it("deve fechar o banner de usuário inativo e persistir com Não mostrar novamente", async () => {
    vi.spyOn(usersService, "getUserById").mockResolvedValue(mockUser);

    const { result } = renderHook(() => useAdminUserDetailVM({ userId: "1" }), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.showInactiveBanner).toBe(true);

    act(() => {
      result.current.handleDontShowAgain();
    });

    expect(result.current.showInactiveBanner).toBe(false);
    expect(window.localStorage.getItem("admin_dont_show_inactive_banner_1")).toBe("true");
  });

  it("deve abrir modal, confirmar exclusão do usuário e redirecionar para a listagem", async () => {
    vi.spyOn(usersService, "getUserById").mockResolvedValue(mockUser);
    const deleteSpy = vi.spyOn(usersService, "deleteUser").mockResolvedValue({ success: true });

    const { result } = renderHook(() => useAdminUserDetailVM({ userId: "1" }), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    act(() => {
      result.current.handleOpenDeleteModal();
    });
    expect(result.current.isDeleteModalOpen).toBe(true);

    await act(async () => {
      await result.current.handleConfirmDelete();
    });

    expect(deleteSpy).toHaveBeenCalledWith("1");
    expect(pushMock).toHaveBeenCalledWith("/admin/usuarios");
  });

  it("falha ao ler ou gravar o localStorage não pode quebrar a tela", async () => {
    vi.spyOn(usersService, "getUserById").mockResolvedValue(mockUser);

    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("SecurityError: Access is denied");
    });
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("SecurityError: Access is denied");
    });

    const { result } = renderHook(() => useAdminUserDetailVM({ userId: "1" }), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.user?.name).toBe("Ana Silva");

    expect(() => {
      act(() => {
        result.current.handleDontShowAgain();
      });
    }).not.toThrow();

    expect(result.current.showInactiveBanner).toBe(false);
  });

  it("avalia canAssignJourney e os 4 cenários de jornada em andamento / canCancelAssignment", async () => {
    const baseUser: usersService.AdminUserDetails = {
      ...mockUser,
      status: "active",
      activeJourney: {
        id: "aj-1",
        profileId: 2,
        title: "Gestor de Segurança da Informação",
        domain: "security",
        domainLabel: "Segurança da Informação",
        startedAt: "2026-06-01T10:00:00Z",
        origin: "assigned",
        assignedBy: { id: 1, name: "Admin Logado" },
        assigned_by: { id: 1, name: "Admin Logado" },
      },
    };

    vi.spyOn(usersService, "getUserById").mockResolvedValue(baseUser);
    vi.spyOn(usersService, "getAssignableJourneyProfiles").mockResolvedValue([
      { id: 1, namePt: "DPO", nameEn: "DPO", domain: "privacy" },
      { id: 2, namePt: "Gestor SI", nameEn: "InfoSec Manager", domain: "security" },
    ]);

    const { result } = renderHook(() => useAdminUserDetailVM({ userId: "1" }), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.canAssignJourney).toBe(true);
    expect(result.current.canCancelAssignment).toBe(true);

    // Sem permissão journeys.assign -> canAssignJourney false
    act(() => {
      useAuthStore.getState().setAuth({
        id: 1,
        name: "Visualizador",
        email: "viewer@empresa.com",
        role: "common_user",
        permissions: ["users.view"],
        profile: {
          id: "viewer",
          name: "Leitor",
          label: "Leitor",
          role: "common_user",
          user_type_id: 3,
          profile_type_id: 3,
          profile_type_name: "Leitor",
          permissions: ["users.view"],
        },
        active_status: 1,
      });
    });
    expect(result.current.canAssignJourney).toBe(false);
  });

  it("restringe primeira jornada ao perfil escolhido pelo usuário e atribui jornada com sucesso", async () => {
    const firstJourneyUser: usersService.AdminUserDetails = {
      ...mockUser,
      status: "active",
      journeys: [],
      journeysCount: 0,
      activeJourney: null,
      initialJourneyProfileId: 2,
    };

    const assignedResult: usersService.AdminUserDetails = {
      ...firstJourneyUser,
      activeJourney: {
        id: "aj-new",
        profileId: 2,
        title: "Gestor SI",
        domain: "security",
        domainLabel: "Segurança da Informação",
        startedAt: "2026-06-05T10:00:00Z",
        origin: "assigned",
        assignedBy: { id: 1, name: "Admin Logado" },
        assigned_by: { id: 1, name: "Admin Logado" },
      },
    };

    vi.spyOn(usersService, "getUserById").mockResolvedValue(firstJourneyUser);
    vi.spyOn(usersService, "getAssignableJourneyProfiles").mockResolvedValue([
      { id: 1, namePt: "DPO", nameEn: "DPO", domain: "privacy" },
      { id: 2, namePt: "Gestor SI", nameEn: "InfoSec Manager", domain: "security" },
    ]);
    const assignSpy = vi
      .spyOn(usersService, "assignJourneyToUser")
      .mockResolvedValue(assignedResult);

    const { result } = renderHook(() => useAdminUserDetailVM({ userId: "1" }), {
      wrapper: createWrapper(),
    });

    await waitFor(() =>
      expect(result.current.assignableOptions).toHaveLength(1)
    );

    expect(result.current.isFirstJourney).toBe(true);
    expect(result.current.assignableOptions[0].id).toBe(2);

    act(() => {
      result.current.handleOpenAssignModal();
    });

    expect(result.current.isAssignModalOpen).toBe(true);
    expect(result.current.selectedProfileId).toBe(2);

    await act(async () => {
      await result.current.handleConfirmAssignJourney();
    });

    expect(assignSpy).toHaveBeenCalledWith("1", {
      profileId: 2,
      assignedBy: { id: 1, name: "Admin Logado" },
    });
    expect(result.current.isAssignModalOpen).toBe(false);
    expect(result.current.activeJourney?.origin).toBe("assigned");
    expect(result.current.journeySuccessMessage).toBe("assignJourney.success");
  });

  it("permite manter ou confirmar o cancelamento de atribuição feita pelo próprio usuário", async () => {
    const userWithMyAssignment: usersService.AdminUserDetails = {
      ...mockUser,
      status: "active",
      activeJourney: {
        id: "aj-mine",
        profileId: 1,
        title: "Encarregado pelo Tratamento de Dados Pessoais",
        domain: "privacy",
        domainLabel: "Privacidade",
        startedAt: "2026-06-01T10:00:00Z",
        origin: "assigned",
        assignedBy: { id: 1, name: "Admin Logado" },
        assigned_by: { id: 1, name: "Admin Logado" },
      },
    };

    vi.spyOn(usersService, "getUserById").mockResolvedValue(userWithMyAssignment);
    const cancelSpy = vi
      .spyOn(usersService, "cancelAssignedJourney")
      .mockResolvedValue({ ...userWithMyAssignment, activeJourney: null });

    const { result } = renderHook(() => useAdminUserDetailVM({ userId: "1" }), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.canCancelAssignment).toBe(true);

    // Abre confirmação e escolhe "Manter jornada" (fechar)
    act(() => {
      result.current.handleOpenCancelAssignModal();
    });
    expect(result.current.isCancelAssignModalOpen).toBe(true);

    act(() => {
      result.current.handleCloseCancelAssignModal();
    });
    expect(result.current.isCancelAssignModalOpen).toBe(false);
    expect(cancelSpy).not.toHaveBeenCalled();

    // Abre confirmação e confirma o cancelamento
    act(() => {
      result.current.handleOpenCancelAssignModal();
    });
    await act(async () => {
      await result.current.handleConfirmCancelAssignment();
    });

    expect(cancelSpy).toHaveBeenCalledWith("1");
    expect(result.current.activeJourney).toBeNull();
    expect(result.current.isCancelAssignModalOpen).toBe(false);
    expect(result.current.journeySuccessMessage).toBe(
      "activeJourney.cancelSuccess"
    );
  });

  it("não exibe cancelar atribuição para jornada atribuída por outro usuário ou iniciada pelo usuário", async () => {
    vi.spyOn(usersService, "getUserById").mockResolvedValueOnce({
      ...mockUser,
      activeJourney: {
        id: "aj-other",
        profileId: 1,
        title: "Controlador",
        domain: "privacy",
        domainLabel: "Privacidade",
        startedAt: "2026-06-01T10:00:00Z",
        origin: "assigned",
        assignedBy: { id: 99, name: "Outro Gestor" },
        assigned_by: { id: 99, name: "Outro Gestor" },
      },
    });

    const { result } = renderHook(() => useAdminUserDetailVM({ userId: "3" }), {
      wrapper: createWrapper(),
    });
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.canCancelAssignment).toBe(false);

    vi.spyOn(usersService, "getUserById").mockResolvedValueOnce({
      ...mockUser,
      activeJourney: {
        id: "aj-self",
        profileId: 1,
        title: "Controlador",
        domain: "privacy",
        domainLabel: "Privacidade",
        startedAt: "2026-06-01T10:00:00Z",
        origin: "self_started",
        assignedBy: null,
        assigned_by: null,
      },
    });

    const { result: selfResult } = renderHook(
      () => useAdminUserDetailVM({ userId: "1" }),
      { wrapper: createWrapper() }
    );
    await waitFor(() => expect(selfResult.current.isLoading).toBe(false));
    expect(selfResult.current.canCancelAssignment).toBe(false);
  });

  it("retorna lista vazia e não atribui quando usuário é de primeira jornada mas initialJourneyProfileId é nulo", async () => {
    const noInitialUser: usersService.AdminUserDetails = {
      ...mockUser,
      status: "active",
      journeys: [],
      journeysCount: 0,
      activeJourney: null,
      initialJourneyProfileId: undefined,
    };

    vi.spyOn(usersService, "getUserById").mockResolvedValue(noInitialUser);
    vi.spyOn(usersService, "getAssignableJourneyProfiles").mockResolvedValue([
      { id: 1, namePt: "DPO", nameEn: "DPO", domain: "privacy" },
    ]);

    const { result } = renderHook(() => useAdminUserDetailVM({ userId: "1" }), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.isFirstJourney).toBe(true);
    expect(result.current.assignableOptions).toEqual([]);

    act(() => {
      result.current.handleOpenAssignModal();
    });

    expect(result.current.selectedProfileId).toBeNull();
  });

  it("trata erro na atribuição e no cancelamento exibindo mensagens de erro no modal", async () => {
    const firstJourneyUser: usersService.AdminUserDetails = {
      ...mockUser,
      status: "active",
      journeys: [],
      journeysCount: 0,
      activeJourney: null,
      initialJourneyProfileId: 1,
    };

    vi.spyOn(usersService, "getUserById").mockResolvedValue(firstJourneyUser);
    vi.spyOn(usersService, "getAssignableJourneyProfiles").mockResolvedValue([
      { id: 1, namePt: "DPO", nameEn: "DPO", domain: "privacy" },
    ]);
    vi.spyOn(usersService, "assignJourneyToUser").mockRejectedValue(
      new Error("Erro ao atribuir")
    );

    const { result } = renderHook(() => useAdminUserDetailVM({ userId: "1" }), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    act(() => {
      result.current.handleOpenAssignModal();
    });

    await act(async () => {
      await result.current.handleConfirmAssignJourney();
    });

    expect(result.current.isAssignModalOpen).toBe(true);
    expect(result.current.assignErrorMessage).toBe("assignJourney.error");

    // Testar erro de cancelamento
    const userWithAssignment: usersService.AdminUserDetails = {
      ...mockUser,
      activeJourney: {
        id: "aj-test",
        profileId: 1,
        title: "DPO",
        domain: "privacy",
        domainLabel: "Privacidade",
        startedAt: "2026-06-01T10:00:00Z",
        origin: "assigned",
        assignedBy: { id: 1, name: "Admin Logado" },
      },
    };

    vi.spyOn(usersService, "getUserById").mockResolvedValue(userWithAssignment);
    vi.spyOn(usersService, "cancelAssignedJourney").mockRejectedValue(
      new Error("Erro ao cancelar")
    );

    const { result: cancelResult } = renderHook(
      () => useAdminUserDetailVM({ userId: "1" }),
      { wrapper: createWrapper() }
    );

    await waitFor(() => expect(cancelResult.current.isLoading).toBe(false));

    act(() => {
      cancelResult.current.handleOpenCancelAssignModal();
    });

    await act(async () => {
      await cancelResult.current.handleConfirmCancelAssignment();
    });

    expect(cancelResult.current.isCancelAssignModalOpen).toBe(true);
    expect(cancelResult.current.cancelErrorMessage).toBe(
      "activeJourney.cancelError"
    );
  });
});
