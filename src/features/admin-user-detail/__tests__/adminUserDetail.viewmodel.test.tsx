// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import React from "react";
import * as usersService from "@services/usersService";
import * as authService from "@services/authService";
import { useAuthStore } from "@features/auth/auth.store";
import { useAdminUsersStore } from "@features/admin-users/adminUsers.store";
import { ApiRequestError } from "@services/httpClient";
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

const ADMIN_PERMISSIONS = [
  "users.view",
  "users.manage",
  "users.deactivate",
  "users.change_profile",
  "journeys.assign",
];

describe("useAdminUserDetailVM", () => {
  // Usuário diferente do autenticado (id 1): a própria conta tem ações bloqueadas
  const mockUser: usersService.AdminUserDetails = {
    id: "2",
    name: "Ana Silva",
    email: "ana@empresa.com",
    initials: "AS",
    employeeCode: "EMP-1001",
    department: "TI",
    organization: "Secretaria de Governo",
    role: "admin",
    profileTypeId: 1,
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
    // O useAuth confere a sessão em GET /me: sem isso o teste depende de haver API local
    vi.spyOn(authService, "getAuthenticatedUser").mockReturnValue(new Promise(() => {}));
    pushMock.mockClear();
    window.localStorage.clear();
    useAdminUsersStore.getState().setListQuery("");
    useAdminUsersStore.getState().clearDeletedUserName();
    useAuthStore.getState().setAuth({
      id: 1,
      name: "Admin Logado",
      email: "admin@empresa.com",
      role: "administrator",
      permissions: ADMIN_PERMISSIONS,
      profile: {
        id: "admin",
        name: "Administrador",
        label: "Administrador",
        role: "administrator",
        user_type_id: 1,
        profile_type_id: 1,
        profile_type_name: "Administrador",
        permissions: ADMIN_PERMISSIONS,
      },
      active_status: 1,
    });
  });

  it("deve carregar os dados do usuário e inicializar o formulário", async () => {
    vi.spyOn(usersService, "getUserById").mockResolvedValue(mockUser);

    const { result } = renderHook(() => useAdminUserDetailVM({ userId: "2" }), {
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

    const { result } = renderHook(() => useAdminUserDetailVM({ userId: "2" }), {
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

    const { result } = renderHook(() => useAdminUserDetailVM({ userId: "2" }), {
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
    const updateSpy = vi.spyOn(usersService, "updateUser").mockResolvedValue(undefined);
    const profileSpy = vi.spyOn(usersService, "changeUserAccessProfile");

    const { result } = renderHook(() => useAdminUserDetailVM({ userId: "2" }), {
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

    // Só o campo alterado vai no PATCH, e sem troca de perfil não há PUT
    expect(updateSpy).toHaveBeenCalledWith("2", { name: "Ana Silva Atualizada" });
    expect(profileSpy).not.toHaveBeenCalled();
    expect(result.current.saveSuccessMessage).toBe("editForm.saveSuccess");
    expect(result.current.saveErrorMessage).toBeNull();
    // A tela recarrega o usuário (cache invalidado)
    expect(usersService.getUserById).toHaveBeenCalledTimes(2);
  });

  it("deve alternar a ativação da conta", async () => {
    vi.spyOn(usersService, "getUserById").mockResolvedValue(mockUser);
    const toggleSpy = vi.spyOn(usersService, "toggleUserStatus").mockResolvedValue(undefined);

    const { result } = renderHook(() => useAdminUserDetailVM({ userId: "2" }), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    await act(async () => {
      await result.current.handleToggleStatus();
    });

    expect(toggleSpy).toHaveBeenCalledWith("2", "active");
    expect(result.current.statusMessage).toEqual({
      variant: "success",
      text: "status.activateSuccess",
    });
    expect(usersService.getUserById).toHaveBeenCalledTimes(2);
  });

  it("deve fechar o banner de usuário inativo e persistir com Não mostrar novamente", async () => {
    vi.spyOn(usersService, "getUserById").mockResolvedValue(mockUser);

    const { result } = renderHook(() => useAdminUserDetailVM({ userId: "2" }), {
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
    expect(window.localStorage.getItem("admin_dont_show_inactive_banner_2")).toBe("true");
  });

  it("deve abrir modal, confirmar exclusão do usuário e redirecionar para a listagem", async () => {
    vi.spyOn(usersService, "getUserById").mockResolvedValue(mockUser);
    const deleteSpy = vi.spyOn(usersService, "deleteUser").mockResolvedValue(undefined);
    useAdminUsersStore.getState().setListQuery("department=TI&page=2");

    const { result } = renderHook(() => useAdminUserDetailVM({ userId: "2" }), {
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

    expect(deleteSpy).toHaveBeenCalledWith("2");
    // Volta para a listagem com os filtros de antes e o aviso de sucesso
    expect(pushMock).toHaveBeenCalledWith("/admin/usuarios?department=TI&page=2");
    expect(useAdminUsersStore.getState().deletedUserName).toBe("Ana Silva");
    expect(result.current.deleteErrorMessage).toBeNull();
  });

  it("falha ao ler ou gravar o localStorage não pode quebrar a tela", async () => {
    vi.spyOn(usersService, "getUserById").mockResolvedValue(mockUser);

    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("SecurityError: Access is denied");
    });
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("SecurityError: Access is denied");
    });

    const { result } = renderHook(() => useAdminUserDetailVM({ userId: "2" }), {
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

    const { result } = renderHook(() => useAdminUserDetailVM({ userId: "2" }), {
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

  const PROFILES: usersService.AssignableJourneyProfile[] = [
    { id: 1, namePt: "DPO", nameEn: "DPO", domain: "privacy" },
    { id: 2, namePt: "Gestor SI", nameEn: "InfoSec Manager", domain: "security" },
  ];

  const myAssignment: NonNullable<usersService.AdminUserDetails["activeJourney"]> = {
    id: "90",
    profileId: 1,
    title: "Encarregado pelo Tratamento de Dados Pessoais",
    domain: "privacy",
    domainLabel: "Privacidade",
    startedAt: "2026-06-01T10:00:00Z",
    origin: "assigned",
    assignedBy: { id: 1, name: "Admin Logado" },
    assigned_by: { id: 1, name: "Admin Logado" },
  };

  function apiError(status: number, code?: string) {
    return new ApiRequestError("Erro", status, code);
  }

  async function renderWithOpenAssignModal() {
    const hook = renderHook(() => useAdminUserDetailVM({ userId: "2" }), {
      wrapper: createWrapper(),
    });
    await waitFor(() => expect(hook.result.current.assignableOptions.length).toBeGreaterThan(0));
    act(() => hook.result.current.handleOpenAssignModal());
    expect(hook.result.current.selectedProfileId).not.toBeNull();
    return hook;
  }

  it("restringe a primeira jornada ao perfil escolhido, atribui pela API e recarrega o usuário e a listagem", async () => {
    const firstJourneyUser: usersService.AdminUserDetails = {
      ...mockUser,
      status: "active",
      journeys: [],
      journeysCount: 0,
      activeJourney: null,
      initialJourneyProfileId: 2,
    };
    const getUserSpy = vi
      .spyOn(usersService, "getUserById")
      .mockResolvedValueOnce(firstJourneyUser)
      .mockResolvedValue({
        ...firstJourneyUser,
        activeJourney: { ...myAssignment, profileId: 2, title: "Gestor SI" },
      });
    vi.spyOn(usersService, "getAssignableJourneyProfiles").mockResolvedValue(PROFILES);
    const assignSpy = vi.spyOn(usersService, "assignJourneyToUser").mockResolvedValue();

    const { result } = await renderWithOpenAssignModal();

    expect(result.current.isFirstJourney).toBe(true);
    expect(result.current.isInitialProfileRequired).toBe(false);
    expect(result.current.assignableOptions.map((option) => option.id)).toEqual([2]);
    expect(result.current.selectedProfileId).toBe(2);

    await act(async () => {
      await result.current.handleConfirmAssignJourney();
    });

    expect(assignSpy).toHaveBeenCalledWith("2", { profileId: 2 });
    expect(result.current.isAssignModalOpen).toBe(false);
    expect(result.current.journeySuccessMessage).toBe("assignJourney.success");
    await waitFor(() => expect(result.current.activeJourney?.title).toBe("Gestor SI"));
    expect(getUserSpy).toHaveBeenCalledTimes(2);
  });

  it("sem o perfil inicial escolhido, avisa e não deixa atribuir a primeira jornada", async () => {
    const noInitialUser: usersService.AdminUserDetails = {
      ...mockUser,
      status: "active",
      journeys: [],
      journeysCount: 0,
      activeJourney: null,
      initialJourneyProfileId: null,
    };
    vi.spyOn(usersService, "getUserById").mockResolvedValue(noInitialUser);
    vi.spyOn(usersService, "getAssignableJourneyProfiles").mockResolvedValue(PROFILES);
    const assignSpy = vi.spyOn(usersService, "assignJourneyToUser").mockResolvedValue();

    const { result } = renderHook(() => useAdminUserDetailVM({ userId: "2" }), {
      wrapper: createWrapper(),
    });
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.isInitialProfileRequired).toBe(true);
    expect(result.current.assignableOptions).toEqual([]);

    act(() => result.current.handleOpenAssignModal());
    expect(result.current.selectedProfileId).toBeNull();

    await act(async () => {
      await result.current.handleConfirmAssignJourney();
    });
    expect(assignSpy).not.toHaveBeenCalled();
  });

  it.each([
    [apiError(409, "JOURNEY_IN_PROGRESS"), "activeJourney.alreadyActiveHint"],
    [apiError(422, "JOURNEY_PROFILE_SELECTION_REQUIRED"), "assignJourney.selectionRequiredNotice"],
    [apiError(422, "JOURNEY_PROFILE_MISMATCH"), "assignJourney.firstJourneyNotice"],
  ])("ao atribuir, mostra a mensagem do erro %# e recarrega o usuário", async (error, message) => {
    const user: usersService.AdminUserDetails = { ...mockUser, status: "active", activeJourney: null };
    const getUserSpy = vi.spyOn(usersService, "getUserById").mockResolvedValue(user);
    vi.spyOn(usersService, "getAssignableJourneyProfiles").mockResolvedValue(PROFILES);
    vi.spyOn(usersService, "assignJourneyToUser").mockRejectedValue(error);

    const { result } = await renderWithOpenAssignModal();
    await act(async () => {
      await result.current.handleConfirmAssignJourney();
    });

    expect(result.current.assignErrorMessage).toBe(message);
    expect(getUserSpy).toHaveBeenCalledTimes(2);
  });

  it("em erro de rede ou 5xx ao atribuir, mantém o modal aberto para tentar de novo", async () => {
    const user: usersService.AdminUserDetails = { ...mockUser, status: "active", activeJourney: null };
    const getUserSpy = vi.spyOn(usersService, "getUserById").mockResolvedValue(user);
    vi.spyOn(usersService, "getAssignableJourneyProfiles").mockResolvedValue(PROFILES);
    const assignSpy = vi
      .spyOn(usersService, "assignJourneyToUser")
      .mockRejectedValueOnce(apiError(500))
      .mockResolvedValueOnce();

    const { result } = await renderWithOpenAssignModal();
    await act(async () => {
      await result.current.handleConfirmAssignJourney();
    });

    expect(result.current.isAssignModalOpen).toBe(true);
    expect(result.current.assignErrorMessage).toBe("assignJourney.error");
    expect(getUserSpy).toHaveBeenCalledTimes(1);

    await act(async () => {
      await result.current.handleConfirmAssignJourney();
    });

    expect(assignSpy).toHaveBeenCalledTimes(2);
    expect(result.current.isAssignModalOpen).toBe(false);
  });

  it("permite manter a jornada ou cancelar a atribuição pela API, recarregando a caixa", async () => {
    const userWithMyAssignment: usersService.AdminUserDetails = {
      ...mockUser,
      status: "active",
      activeJourney: myAssignment,
    };
    vi.spyOn(usersService, "getUserById")
      .mockResolvedValueOnce(userWithMyAssignment)
      .mockResolvedValue({ ...userWithMyAssignment, activeJourney: null });
    const cancelSpy = vi.spyOn(usersService, "cancelAssignedJourney").mockResolvedValue();

    const { result } = renderHook(() => useAdminUserDetailVM({ userId: "2" }), {
      wrapper: createWrapper(),
    });
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.canCancelAssignment).toBe(true);

    act(() => result.current.handleOpenCancelAssignModal());
    act(() => result.current.handleCloseCancelAssignModal());
    expect(result.current.isCancelAssignModalOpen).toBe(false);
    expect(cancelSpy).not.toHaveBeenCalled();

    act(() => result.current.handleOpenCancelAssignModal());
    await act(async () => {
      await result.current.handleConfirmCancelAssignment();
    });

    expect(cancelSpy).toHaveBeenCalledWith("90");
    expect(result.current.isCancelAssignModalOpen).toBe(false);
    expect(result.current.journeySuccessMessage).toBe("activeJourney.cancelSuccess");
    await waitFor(() => expect(result.current.activeJourney).toBeNull());
  });

  it.each([
    [apiError(403, "PERMISSION_DENIED"), "activeJourney.cancelForbidden", 2],
    [apiError(409, "JOURNEY_CANCELLATION_NOT_ALLOWED"), "activeJourney.cancelNotAllowed", 2],
    [apiError(500), "activeJourney.cancelError", 1],
  ])("ao cancelar, mostra a mensagem do erro %# e recarrega quando a tela pode estar desatualizada", async (error, message, userCalls) => {
    const userWithMyAssignment: usersService.AdminUserDetails = {
      ...mockUser,
      status: "active",
      activeJourney: myAssignment,
    };
    const getUserSpy = vi.spyOn(usersService, "getUserById").mockResolvedValue(userWithMyAssignment);
    vi.spyOn(usersService, "cancelAssignedJourney").mockRejectedValue(error);

    const { result } = renderHook(() => useAdminUserDetailVM({ userId: "2" }), {
      wrapper: createWrapper(),
    });
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    act(() => result.current.handleOpenCancelAssignModal());
    await act(async () => {
      await result.current.handleConfirmCancelAssignment();
    });

    expect(result.current.isCancelAssignModalOpen).toBe(true);
    expect(result.current.cancelErrorMessage).toBe(message);
    expect(getUserSpy).toHaveBeenCalledTimes(userCalls);
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
      () => useAdminUserDetailVM({ userId: "2" }),
      { wrapper: createWrapper() }
    );
    await waitFor(() => expect(selfResult.current.isLoading).toBe(false));
    expect(selfResult.current.canCancelAssignment).toBe(false);
  });

  async function renderLoaded(user: usersService.AdminUserDetails = mockUser) {
    vi.spyOn(usersService, "getUserById").mockResolvedValue(user);
    const hook = renderHook(() => useAdminUserDetailVM({ userId: user.id }), {
      wrapper: createWrapper(),
    });
    await waitFor(() => expect(hook.result.current.isLoading).toBe(false));
    return hook;
  }

  it("mostra o estado de não encontrado no 404", async () => {
    vi.spyOn(usersService, "getUserById").mockRejectedValue(
      new ApiRequestError("Usuario nao encontrado.", 404, "USER_NOT_FOUND")
    );

    const { result } = renderHook(() => useAdminUserDetailVM({ userId: "99" }), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.isNotFound).toBe(true);
    expect(result.current.errorMessage).toBe("notFound.description");
  });

  it("mostra erro de carregamento com nova tentativa para falhas que não são 404", async () => {
    const getSpy = vi
      .spyOn(usersService, "getUserById")
      .mockRejectedValueOnce(new ApiRequestError("Falhou", 500))
      .mockResolvedValue(mockUser);

    const { result } = renderHook(() => useAdminUserDetailVM({ userId: "2" }), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.isNotFound).toBe(false);
    expect(result.current.errorMessage).toBe("loadError");

    act(() => {
      result.current.handleRetry();
    });
    await waitFor(() => expect(result.current.user?.name).toBe("Ana Silva"));
    expect(getSpy).toHaveBeenCalledTimes(2);
  });

  it("usa a query da listagem no link de voltar", async () => {
    useAdminUsersStore.getState().setListQuery("search=ana&page=3");
    const { result } = await renderLoaded();

    expect(result.current.backHref).toBe("/admin/usuarios?search=ana&page=3");
  });

  it("troca o perfil pelo PUT de perfil de acesso, sem PATCH quando só o perfil mudou", async () => {
    const updateSpy = vi.spyOn(usersService, "updateUser");
    const profileSpy = vi
      .spyOn(usersService, "changeUserAccessProfile")
      .mockResolvedValue(undefined);
    const { result } = await renderLoaded();

    act(() => {
      result.current.handleFieldChange("role", "manager");
    });
    await act(async () => {
      await result.current.handleSaveForm();
    });

    expect(updateSpy).not.toHaveBeenCalled();
    expect(profileSpy).toHaveBeenCalledWith("2", "manager");
    expect(result.current.saveSuccessMessage).toBe("editForm.saveSuccess");
  });

  it("salva os dados e depois o perfil quando os dois mudaram", async () => {
    const calls: string[] = [];
    vi.spyOn(usersService, "updateUser").mockImplementation(async () => {
      calls.push("patch");
    });
    vi.spyOn(usersService, "changeUserAccessProfile").mockImplementation(async () => {
      calls.push("put");
    });
    const { result } = await renderLoaded();

    act(() => {
      result.current.handleFieldChange("department", "Jurídico");
      result.current.handleFieldChange("employeeCode", "EMP-2");
      result.current.handleFieldChange("role", "user");
    });
    await act(async () => {
      await result.current.handleSaveForm();
    });

    expect(usersService.updateUser).toHaveBeenCalledWith("2", {
      department: "Jurídico",
      employeeCode: "EMP-2",
    });
    expect(calls).toEqual(["patch", "put"]);
  });

  it("valida nome e sobrenome e o tamanho máximo antes de chamar a API", async () => {
    const updateSpy = vi.spyOn(usersService, "updateUser");
    const { result } = await renderLoaded();

    act(() => {
      result.current.handleFieldChange("name", "Ana");
      result.current.handleFieldChange("employeeCode", "X".repeat(51));
      result.current.handleFieldChange("organization", "");
    });
    await act(async () => {
      await result.current.handleSaveForm();
    });

    expect(updateSpy).not.toHaveBeenCalled();
    expect(result.current.formErrors).toMatchObject({
      name: "editForm.validation.nameSurname",
      employeeCode: "editForm.validation.maxLength",
      organization: "editForm.validation.organizationRequired",
    });
  });

  it("mostra os erros de validação da API em cada campo", async () => {
    vi.spyOn(usersService, "updateUser").mockRejectedValue(
      new ApiRequestError("Validation error.", 422, "VALIDATION_ERROR", {
        name: ["Informe nome e sobrenome."],
        registration_number: ["O codigo de funcionario deve ter no maximo 50 caracteres."],
      })
    );
    const { result } = await renderLoaded();

    act(() => {
      result.current.handleFieldChange("name", "Ana Souza");
    });
    await act(async () => {
      await result.current.handleSaveForm();
    });

    expect(result.current.formErrors).toMatchObject({
      name: "Informe nome e sobrenome.",
      employeeCode: "O codigo de funcionario deve ter no maximo 50 caracteres.",
    });
    expect(result.current.saveErrorMessage).toBe("errors.validation");
    expect(result.current.saveSuccessMessage).toBeNull();
    // Nada foi gravado: o formulário mantém o que a pessoa digitou
    expect(result.current.formData.name).toBe("Ana Souza");
    expect(usersService.getUserById).toHaveBeenCalledTimes(1);
  });

  it("mostra o e-mail já usado no campo de e-mail", async () => {
    vi.spyOn(usersService, "updateUser").mockRejectedValue(
      new ApiRequestError("Ja existe", 409, "EMAIL_ALREADY_IN_USE", { email: ["Informe outro e-mail."] })
    );
    const { result } = await renderLoaded();

    act(() => {
      result.current.handleFieldChange("email", "outro@empresa.com");
    });
    await act(async () => {
      await result.current.handleSaveForm();
    });

    expect(result.current.formErrors.email).toBe("errors.emailInUse");
    expect(result.current.saveErrorMessage).toBeNull();
  });

  it("mostra o erro de último administrador no perfil e recarrega se o PATCH já tinha gravado", async () => {
    vi.spyOn(usersService, "updateUser").mockResolvedValue(undefined);
    vi.spyOn(usersService, "changeUserAccessProfile").mockRejectedValue(
      new ApiRequestError("Ultimo admin", 409, "LAST_ADMIN_REQUIRED")
    );
    const { result } = await renderLoaded();

    act(() => {
      result.current.handleFieldChange("department", "Jurídico");
      result.current.handleFieldChange("role", "user");
    });
    await act(async () => {
      await result.current.handleSaveForm();
    });

    expect(result.current.formErrors.role).toBe("errors.lastAdmin");
    expect(result.current.saveSuccessMessage).toBeNull();
    expect(usersService.getUserById).toHaveBeenCalledTimes(2);
  });

  it.each([
    ["SELF_PROFILE_CHANGE_FORBIDDEN", 403, "role", "errors.selfProfileChange"],
    ["PERMISSION_DENIED", 403, "general", "errors.permissionDenied"],
    [undefined, 500, "general", "errors.saveFailed"],
  ])("trata o erro %s ao salvar", async (code, status, target, message) => {
    vi.spyOn(usersService, "changeUserAccessProfile").mockRejectedValue(
      new ApiRequestError("Erro", status, code)
    );
    const { result } = await renderLoaded();

    act(() => {
      result.current.handleFieldChange("role", "manager");
    });
    await act(async () => {
      await result.current.handleSaveForm();
    });

    if (target === "role") {
      expect(result.current.formErrors.role).toBe(message);
    } else {
      expect(result.current.saveErrorMessage).toBe(message);
    }
  });

  it("desativa uma conta ativa e mostra os erros da API", async () => {
    const toggleSpy = vi
      .spyOn(usersService, "toggleUserStatus")
      .mockRejectedValueOnce(new ApiRequestError("Ultimo admin", 409, "LAST_ADMIN_REQUIRED"))
      .mockRejectedValueOnce(
        new ApiRequestError("Estado invalido", 409, "INVALID_USER_ACCOUNT_STATE")
      );
    const { result } = await renderLoaded({ ...mockUser, status: "active" });

    await act(async () => {
      await result.current.handleToggleStatus();
    });
    expect(toggleSpy).toHaveBeenLastCalledWith("2", "inactive");
    expect(result.current.statusMessage).toEqual({
      variant: "destructive",
      text: "errors.lastAdmin",
    });

    await act(async () => {
      await result.current.handleToggleStatus();
    });
    expect(result.current.statusMessage?.text).toBe("errors.invalidAccountState");

    act(() => {
      result.current.handleDismissStatusMessage();
    });
    expect(result.current.statusMessage).toBeNull();
  });

  it("ativa uma conta pendente pela mesma rota", async () => {
    const toggleSpy = vi.spyOn(usersService, "toggleUserStatus").mockResolvedValue(undefined);
    const { result } = await renderLoaded({ ...mockUser, status: "pending" });

    expect(result.current.showInactiveBanner).toBe(false);
    await act(async () => {
      await result.current.handleToggleStatus();
    });
    expect(toggleSpy).toHaveBeenCalledWith("2", "active");
  });

  it("mantém o modal aberto com a mensagem quando a exclusão falha", async () => {
    vi.spyOn(usersService, "deleteUser").mockRejectedValue(
      new ApiRequestError("Ultimo admin", 409, "LAST_ADMIN_REQUIRED")
    );
    const { result } = await renderLoaded();

    act(() => {
      result.current.handleOpenDeleteModal();
    });
    await act(async () => {
      await result.current.handleConfirmDelete();
    });

    expect(result.current.isDeleteModalOpen).toBe(true);
    expect(result.current.deleteErrorMessage).toBe("errors.lastAdmin");
    expect(pushMock).not.toHaveBeenCalled();

    act(() => {
      result.current.handleCloseDeleteModal();
    });
    expect(result.current.isDeleteModalOpen).toBe(false);
    expect(result.current.deleteErrorMessage).toBeNull();
  });

  it("bloqueia desativar, excluir e trocar o perfil da própria conta", async () => {
    const { result } = await renderLoaded({ ...mockUser, id: "1", status: "inactive" });

    expect(result.current.canToggleStatus).toBe(false);
    expect(result.current.canDeleteUser).toBe(false);
    expect(result.current.canManageRoles).toBe(false);
    expect(result.current.canManageUser).toBe(true);
    expect(result.current.showInactiveBanner).toBe(false);
  });

  it("libera cada ação pela permissão correspondente", async () => {
    useAuthStore.getState().setAuth({
      id: 1,
      name: "Gestor",
      email: "gestor@empresa.com",
      role: "common_user",
      permissions: ["users.view", "journeys.assign"],
      profile: {
        id: "manager",
        name: "Gestor",
        label: "Gestor",
        role: "common_user",
        user_type_id: 2,
        profile_type_id: 2,
        profile_type_name: "Gestor",
        permissions: ["users.view", "journeys.assign"],
      },
      active_status: 1,
    });
    const { result } = await renderLoaded();

    expect(result.current.canManageUser).toBe(false);
    expect(result.current.canToggleStatus).toBe(false);
    expect(result.current.canDeleteUser).toBe(false);
    expect(result.current.canManageRoles).toBe(false);
  });
});
