// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import * as authService from "@services/authService";
import { useAuthVM } from "../auth.viewmodel";
import type { AuthenticatedUser } from "../auth.types";

const mockUser: AuthenticatedUser = {
  id: 1,
  name: "Maria Silva",
  email: "maria.silva@example.com",
  role: "common_user",
  profile: {
    role: "common_user",
    label: "Usuario comum",
    user_type_id: 2,
    profile_type_id: 1,
    profile_type_name: "Aluno",
  },
  active_status: 1,
};

const setAuthMock = vi.fn();
const clearQueriesMock = vi.fn();
const routerPushMock = vi.fn();

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}));

vi.mock("@/shared/i18n/navigation", () => ({
  useRouter: () => ({ push: routerPushMock }),
}));

let mockSearch = "";

vi.mock("next/navigation", () => ({
  useSearchParams: () => new URLSearchParams(mockSearch),
}));

vi.mock("@tanstack/react-query", () => ({
  useQueryClient: () => ({ clear: clearQueriesMock }),
}));

vi.mock("@/hooks/useAuth", () => ({
  useAuth: () => ({ setAuth: setAuthMock }),
}));

describe("Auth ViewModel Logic (useAuthVM)", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    setAuthMock.mockClear();
    clearQueriesMock.mockClear();
    routerPushMock.mockClear();
  });

  it("deve autenticar e redirecionar para /painel quando o login é bem-sucedido", async () => {
    const spy = vi.spyOn(authService, "login").mockResolvedValueOnce(mockUser);

    const { result } = renderHook(() => useAuthVM());

    await act(async () => {
      result.current.form.setValue("email", "maria.silva@example.com");
      result.current.form.setValue("password", "secret123");
    });

    await act(async () => {
      await result.current.handleSubmit();
    });

    expect(spy).toHaveBeenCalledWith({
      email: "maria.silva@example.com",
      password: "secret123",
    });
    expect(setAuthMock).toHaveBeenCalledWith(mockUser);
    expect(routerPushMock).toHaveBeenCalledWith("/painel");
    expect(result.current.serverMessage).toBeNull();
    // O cache da sessão anterior é descartado antes de autenticar
    expect(clearQueriesMock).toHaveBeenCalledTimes(1);
    expect(clearQueriesMock.mock.invocationCallOrder[0]).toBeLessThan(
      setAuthMock.mock.invocationCallOrder[0]
    );
  });

  it("deve exibir a mensagem de erro do backend quando as credenciais são inválidas", async () => {
    vi.spyOn(authService, "login").mockRejectedValueOnce(
      new Error("Usuário e/ou senha inválidos.")
    );

    const { result } = renderHook(() => useAuthVM());

    await act(async () => {
      result.current.form.setValue("email", "maria.silva@example.com");
      result.current.form.setValue("password", "wrong");
    });

    await act(async () => {
      await result.current.handleSubmit();
    });

    expect(setAuthMock).not.toHaveBeenCalled();
    expect(routerPushMock).not.toHaveBeenCalled();
    expect(clearQueriesMock).not.toHaveBeenCalled();
    expect(result.current.serverMessage).toEqual({
      title: "serverError.title",
      description: "Usuário e/ou senha inválidos.",
      variant: "destructive",
    });
  });

  it("não deve submeter quando o e-mail é inválido", async () => {
    const spy = vi.spyOn(authService, "login");

    const { result } = renderHook(() => useAuthVM());

    await act(async () => {
      result.current.form.setValue("email", "nao-e-um-email", {
        shouldValidate: true,
        shouldTouch: true,
        shouldDirty: true,
      });
      result.current.form.setValue("password", "secret123", {
        shouldValidate: true,
        shouldTouch: true,
        shouldDirty: true,
      });
    });

    await act(async () => {
      await result.current.handleSubmit();
    });

    expect(spy).not.toHaveBeenCalled();
    expect(result.current.form.formState.errors.email?.message).toBe(
      "validation.emailInvalid"
    );
  });
});

describe("useAuthVM com página de retorno", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    setAuthMock.mockClear();
    clearQueriesMock.mockClear();
    routerPushMock.mockClear();
  });

  afterEach(() => {
    mockSearch = "";
  });

  async function submitValidCredentials(result: { current: ReturnType<typeof useAuthVM> }) {
    await act(async () => {
      result.current.form.setValue("email", "maria.silva@example.com");
      result.current.form.setValue("password", "secret123");
    });
    await act(async () => {
      await result.current.handleSubmit();
    });
  }

  it("deve avisar que a sessão expirou ao chegar pelo aviso de sessão expirada", () => {
    mockSearch = "reason=session_expired&redirect=%2Fjornadas";

    const { result } = renderHook(() => useAuthVM());

    expect(result.current.serverMessage).toEqual({
      title: "title",
      description: "description",
      variant: "warning",
    });
  });

  it("deve ocultar o aviso de sessão expirada ao fechá-lo", () => {
    mockSearch = "reason=session_expired";

    const { result } = renderHook(() => useAuthVM());
    act(() => result.current.onCloseMsg());

    expect(result.current.serverMessage).toBeNull();
  });

  it("deve trocar o aviso pelo erro quando o login falhar", async () => {
    mockSearch = "reason=session_expired";
    vi.spyOn(authService, "login").mockRejectedValueOnce(new Error("Usuario e/ou senha invalidos."));

    const { result } = renderHook(() => useAuthVM());
    await submitValidCredentials(result);

    expect(result.current.serverMessage).toMatchObject({
      description: "Usuario e/ou senha invalidos.",
      variant: "destructive",
    });
  });

  it("não deve mostrar o aviso em um acesso comum ao login", () => {
    mockSearch = "redirect=%2Fjornadas";

    const { result } = renderHook(() => useAuthVM());

    expect(result.current.serverMessage).toBeNull();
  });

  it("deve voltar para a página em que o usuário estava depois do login", async () => {
    mockSearch = "reason=session_expired&redirect=%2Fjornadas%3Fpage%3D2";
    vi.spyOn(authService, "login").mockResolvedValueOnce(mockUser);

    const { result } = renderHook(() => useAuthVM());
    await submitValidCredentials(result);

    expect(routerPushMock).toHaveBeenCalledWith("/jornadas?page=2");
    expect(result.current.serverMessage).toBeNull();
  });

  it("deve ignorar uma página de retorno externa e ir para o painel", async () => {
    mockSearch = "redirect=%2F%2Fsite-malicioso.com";
    vi.spyOn(authService, "login").mockResolvedValueOnce(mockUser);

    const { result } = renderHook(() => useAuthVM());
    await submitValidCredentials(result);

    expect(routerPushMock).toHaveBeenCalledWith("/painel");
  });
});
