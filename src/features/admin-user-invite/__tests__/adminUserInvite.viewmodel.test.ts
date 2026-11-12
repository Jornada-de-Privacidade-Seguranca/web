// @vitest-environment jsdom
import { act, renderHook } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createElement, type PropsWithChildren } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ApiRequestError } from "@services/httpClient";
import * as usersService from "@services/usersService";
import { useAdminUsersStore } from "@features/admin-users/adminUsers.store";
import { useAdminUserInviteVM } from "../adminUserInvite.viewmodel";

const { pushMock, canMock } = vi.hoisted(() => ({
  pushMock: vi.fn(),
  canMock: vi.fn(),
}));

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}));

vi.mock("@/shared/i18n/navigation", () => ({
  useRouter: () => ({
    push: pushMock,
    replace: vi.fn(),
  }),
}));

vi.mock("@/hooks/usePermission", () => ({
  usePermission: () => ({
    can: canMock,
  }),
}));

function createWrapper(queryClient?: QueryClient) {
  const client =
    queryClient ??
    new QueryClient({
      defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
    });
  return function Wrapper({ children }: PropsWithChildren) {
    return createElement(QueryClientProvider, { client }, children);
  };
}

function makeFormEvent() {
  return {
    preventDefault: vi.fn(),
  } as unknown as React.FormEvent<HTMLFormElement>;
}

describe("useAdminUserInviteVM", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    pushMock.mockClear();
    canMock.mockReset();
    canMock.mockReturnValue(true);
    useAdminUsersStore.getState().clearInvitedEmail();
  });

  it("inicia com perfil padrão Usuário e valida formato e obrigatoriedade do e-mail", async () => {
    const inviteSpy = vi.spyOn(usersService, "inviteUser");
    const { result } = renderHook(() => useAdminUserInviteVM(), {
      wrapper: createWrapper(),
    });

    expect(result.current.role).toBe("user");
    expect(result.current.summaryTitle).toBe("summary.emptyTitle");
    expect(result.current.summaryRoleLabel).toBe("roles.user");

    await act(async () => {
      await result.current.handleSubmit(makeFormEvent());
    });

    expect(result.current.emailError).toBe("errors.emailRequired");
    expect(inviteSpy).not.toHaveBeenCalled();

    act(() => {
      result.current.handleEmailChange("email-invalido");
    });

    expect(result.current.emailError).toBeNull();
    expect(result.current.summaryTitle).toBe("email-invalido");

    await act(async () => {
      await result.current.handleSubmit(makeFormEvent());
    });

    expect(result.current.emailError).toBe("errors.emailInvalid");
    expect(inviteSpy).not.toHaveBeenCalled();
  });

  it("trava o perfil em Usuário quando falta a permissão users.change_profile", async () => {
    canMock.mockImplementation((perm: string) => perm !== "users.change_profile");
    const inviteSpy = vi.spyOn(usersService, "inviteUser").mockResolvedValue({
      id: "99",
      email: "travado@empresa.com",
      role: "user",
      roleLabel: "Usuário",
      status: "pending",
      expiresAt: "2026-11-12T01:00:00Z",
    });

    const { result } = renderHook(() => useAdminUserInviteVM(), {
      wrapper: createWrapper(),
    });

    expect(result.current.canChangeProfile).toBe(false);
    expect(result.current.role).toBe("user");

    act(() => {
      result.current.handleRoleChange("admin");
      result.current.handleEmailChange("travado@empresa.com");
    });

    expect(result.current.role).toBe("user");
    expect(result.current.summaryRoleLabel).toBe("roles.user");

    await act(async () => {
      await result.current.handleSubmit(makeFormEvent());
    });

    expect(inviteSpy).toHaveBeenCalledWith({
      email: "travado@empresa.com",
      role: "user",
    });
  });

  it("envia convite com sucesso (201), invalida listagem e redireciona para /admin/usuarios", async () => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
    });
    const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");
    const inviteSpy = vi.spyOn(usersService, "inviteUser").mockResolvedValue({
      id: "10",
      email: "maria@empresa.com",
      role: "manager",
      roleLabel: "Gestor",
      status: "pending",
      expiresAt: "2026-11-12T01:00:00Z",
    });

    const { result } = renderHook(() => useAdminUserInviteVM(), {
      wrapper: createWrapper(queryClient),
    });

    act(() => {
      result.current.handleEmailChange("  maria@empresa.com  ");
      result.current.handleRoleChange("manager");
    });

    await act(async () => {
      await result.current.handleSubmit(makeFormEvent());
    });

    expect(inviteSpy).toHaveBeenCalledWith({
      email: "maria@empresa.com",
      role: "manager",
    });
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["admin", "users"] });
    expect(pushMock).toHaveBeenCalledWith("/admin/usuarios");
    expect(useAdminUsersStore.getState().invitedEmail).toBe("maria@empresa.com");
  });

  it("associa erro 409 / ACCOUNT_ALREADY_EXISTS diretamente ao campo de e-mail", async () => {
    vi.spyOn(usersService, "inviteUser").mockRejectedValue(
      new ApiRequestError(
        "Já existe uma conta cadastrada com este e-mail.",
        409,
        "ACCOUNT_ALREADY_EXISTS"
      )
    );

    const { result } = renderHook(() => useAdminUserInviteVM(), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.handleEmailChange("existente@empresa.com");
      result.current.handleRoleChange("admin");
    });

    await act(async () => {
      await result.current.handleSubmit(makeFormEvent());
    });

    expect(result.current.emailError).toBe("errors.accountAlreadyExists");
    expect(result.current.submitError).toBeNull();
    expect(result.current.email).toBe("existente@empresa.com");
    expect(result.current.role).toBe("admin");
    expect(pushMock).not.toHaveBeenCalled();
  });

  it("exibe erro genérico em falha inesperada preservando os dados digitados", async () => {
    vi.spyOn(usersService, "inviteUser").mockRejectedValue(
      new ApiRequestError("Server error", 500)
    );

    const { result } = renderHook(() => useAdminUserInviteVM(), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.handleEmailChange("novo@empresa.com");
      result.current.handleRoleChange("manager");
    });

    await act(async () => {
      await result.current.handleSubmit(makeFormEvent());
    });

    expect(result.current.submitError).toBe("errors.genericSubmit");
    expect(result.current.emailError).toBeNull();
    expect(result.current.email).toBe("novo@empresa.com");
    expect(result.current.role).toBe("manager");
    expect(pushMock).not.toHaveBeenCalled();
  });

  it("retorna para /admin/usuarios ao cancelar sem chamar inviteUser", () => {
    const inviteSpy = vi.spyOn(usersService, "inviteUser");
    const { result } = renderHook(() => useAdminUserInviteVM(), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.handleCancel();
    });

    expect(inviteSpy).not.toHaveBeenCalled();
    expect(pushMock).toHaveBeenCalledWith("/admin/usuarios");
  });
});
