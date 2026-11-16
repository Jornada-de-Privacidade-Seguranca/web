// @vitest-environment jsdom
import { act, renderHook, waitFor } from "@testing-library/react";
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
  useLocale: () => "pt",
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

const ACCESS_PROFILES = [
  { id: 1, role: "admin" as const, name: "Administrador", description: "", permissions: [] },
  { id: 2, role: "manager" as const, name: "Gestor", description: "", permissions: [] },
  { id: 3, role: "user" as const, name: "Usuário", description: "", isDefault: true, permissions: [] },
];

function inviteResponse(email: string, profileTypeId: number) {
  return { id: "10", email, profileTypeId, status: "pending" as const };
}

describe("useAdminUserInviteVM", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    pushMock.mockClear();
    canMock.mockReset();
    canMock.mockReturnValue(true);
    useAdminUsersStore.getState().clearInvitedEmail();
    useAdminUsersStore.getState().setListQuery("");
    vi.spyOn(usersService, "getAccessProfiles").mockResolvedValue(ACCESS_PROFILES);
  });

  it("inicia com perfil padrão Usuário e valida formato e obrigatoriedade do e-mail", async () => {
    const inviteSpy = vi.spyOn(usersService, "inviteUser");
    const { result } = renderHook(() => useAdminUserInviteVM(), {
      wrapper: createWrapper(),
    });

    expect(result.current.profileTypeId).toBe(3);
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
    const inviteSpy = vi
      .spyOn(usersService, "inviteUser")
      .mockResolvedValue(inviteResponse("travado@empresa.com", 3));

    const { result } = renderHook(() => useAdminUserInviteVM(), {
      wrapper: createWrapper(),
    });

    expect(result.current.canChangeProfile).toBe(false);
    expect(result.current.profileTypeId).toBe(3);

    act(() => {
      result.current.handleRoleChange(1);
      result.current.handleEmailChange("travado@empresa.com");
    });

    expect(result.current.profileTypeId).toBe(3);
    await waitFor(() => expect(result.current.summaryRoleLabel).toBe("Usuário"));
    // Sem a permissão, a lista mostra só o perfil Usuário
    expect(result.current.roleOptions).toEqual([{ value: 3, label: "Usuário" }]);

    await act(async () => {
      await result.current.handleSubmit(makeFormEvent());
    });

    expect(inviteSpy).toHaveBeenCalledWith({
      email: "travado@empresa.com",
      profileTypeId: 3,
    });
  });

  it("envia convite com sucesso (201), invalida listagem e redireciona para /admin/usuarios", async () => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
    });
    const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");
    const inviteSpy = vi
      .spyOn(usersService, "inviteUser")
      .mockResolvedValue(inviteResponse("maria@empresa.com", 2));
    useAdminUsersStore.getState().setListQuery("status=pending");

    const { result } = renderHook(() => useAdminUserInviteVM(), {
      wrapper: createWrapper(queryClient),
    });

    act(() => {
      result.current.handleEmailChange("  maria@empresa.com  ");
      result.current.handleRoleChange(2);
    });

    await act(async () => {
      await result.current.handleSubmit(makeFormEvent());
    });

    expect(inviteSpy).toHaveBeenCalledWith({
      email: "maria@empresa.com",
      profileTypeId: 2,
    });
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["admin", "users"] });
    // Volta para a listagem com os filtros de antes
    expect(pushMock).toHaveBeenCalledWith("/admin/usuarios?status=pending");
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
      result.current.handleRoleChange(1);
    });

    await act(async () => {
      await result.current.handleSubmit(makeFormEvent());
    });

    expect(result.current.emailError).toBe("errors.accountAlreadyExists");
    expect(result.current.submitError).toBeNull();
    expect(result.current.email).toBe("existente@empresa.com");
    expect(result.current.profileTypeId).toBe(1);
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
      result.current.handleRoleChange(2);
    });

    await act(async () => {
      await result.current.handleSubmit(makeFormEvent());
    });

    expect(result.current.submitError).toBe("errors.genericSubmit");
    expect(result.current.emailError).toBeNull();
    expect(result.current.email).toBe("novo@empresa.com");
    expect(result.current.profileTypeId).toBe(2);
    expect(pushMock).not.toHaveBeenCalled();
  });

  it("lista os perfis de GET /access-profiles, com o padrão Usuário primeiro", async () => {
    const { result } = renderHook(() => useAdminUserInviteVM(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.roleOptions).toHaveLength(3));
    expect(usersService.getAccessProfiles).toHaveBeenCalledWith("pt");
    expect(result.current.roleOptions).toEqual([
      { value: 3, label: "Usuário" },
      { value: 1, label: "Administrador" },
      { value: 2, label: "Gestor" },
    ]);
    expect(result.current.profileTypeId).toBe(3);
    expect(result.current.summaryRoleLabel).toBe("Usuário");
  });

  it("sem os perfis, mantém o convite com Usuário e oferece nova tentativa", async () => {
    const profilesSpy = vi
      .spyOn(usersService, "getAccessProfiles")
      .mockRejectedValueOnce(new Error("falhou"))
      .mockResolvedValue(ACCESS_PROFILES);

    const { result } = renderHook(() => useAdminUserInviteVM(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isProfilesError).toBe(true));
    expect(result.current.roleOptions).toEqual([{ value: 3, label: "roles.user" }]);

    act(() => {
      result.current.handleRetryProfiles();
    });
    await waitFor(() => expect(result.current.roleOptions).toHaveLength(3));
    expect(profilesSpy).toHaveBeenCalledTimes(2);
  });

  it.each([
    [new ApiRequestError("Sem permissão", 403, "PERMISSION_DENIED"), "errors.permissionDenied"],
    [new ApiRequestError("Muitas tentativas", 429, "TOO_MANY_ATTEMPTS"), "errors.tooManyAttempts"],
  ])("mostra a mensagem própria para %s", async (error, message) => {
    vi.spyOn(usersService, "inviteUser").mockRejectedValue(error);
    const { result } = renderHook(() => useAdminUserInviteVM(), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.handleEmailChange("novo@empresa.com");
    });
    await act(async () => {
      await result.current.handleSubmit(makeFormEvent());
    });

    expect(result.current.submitError).toBe(message);
    expect(pushMock).not.toHaveBeenCalled();
  });

  it("leva os erros do 422 aos campos de e-mail e perfil", async () => {
    vi.spyOn(usersService, "inviteUser").mockRejectedValue(
      new ApiRequestError("Validation error.", 422, "VALIDATION_ERROR", {
        email: ["Informe um e-mail valido."],
        profile_type_id: ["Informe um perfil de acesso valido."],
      })
    );
    const { result } = renderHook(() => useAdminUserInviteVM(), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.handleEmailChange("novo@empresa.com");
    });
    await act(async () => {
      await result.current.handleSubmit(makeFormEvent());
    });

    expect(result.current.emailError).toBe("Informe um e-mail valido.");
    expect(result.current.roleError).toBe("Informe um perfil de acesso valido.");
    expect(result.current.submitError).toBeNull();
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
