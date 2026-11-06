// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import React from "react";
import * as usersService from "@services/usersService";
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
        title: "Fundamentos LGPD",
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
});
