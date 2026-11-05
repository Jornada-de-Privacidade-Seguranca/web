// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";
import { AxiosError, type AxiosResponse } from "axios";
import { useRequireAuth } from "../useAuthGuard";
import { resetAuthBootstrap, useAuth } from "../useAuth";
import { useAuthStore } from "@features/auth/auth.store";
import * as authService from "@services/authService";
import { apiRequest, axiosInstance } from "@services/httpClient";
import { hadPreviousSession, markSessionStarted } from "@/shared/utils/sessionMarker";
import type { AuthenticatedUser } from "@features/auth/auth.types";

const routerReplaceMock = vi.fn();

vi.mock("@/shared/i18n/navigation", () => ({
  useRouter: () => ({ replace: routerReplaceMock }),
  usePathname: () => "/jornadas",
}));

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

function unauthenticatedError(): AxiosError {
  return new AxiosError("Request failed", "ERR_BAD_REQUEST", undefined, undefined, {
    data: { success: false, message: "Usuario nao autenticado.", code: "UNAUTHENTICATED" },
    status: 401,
    statusText: "",
    headers: {},
    config: {} as AxiosResponse["config"],
  } as AxiosResponse);
}

const originalAdapter = axiosInstance.defaults.adapter;

/** Faz toda requisição responder 401 pelo adaptador, passando pelos interceptadores. */
function respondUnauthorized() {
  axiosInstance.defaults.adapter = async (config) => {
    const error = unauthenticatedError();
    error.config = config;
    throw error;
  };
}

/** Simula o /me respondendo 401 ao carregar a página. */
function mockMeUnauthorized() {
  vi.spyOn(authService, "getAuthenticatedUser").mockImplementationOnce(() => apiRequest("/me"));
  respondUnauthorized();
}

describe("expiração da sessão", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    axiosInstance.defaults.adapter = originalAdapter;
    routerReplaceMock.mockClear();
    resetAuthBootstrap();
    window.localStorage.clear();
    useAuthStore.setState({
      user: null,
      isAuthenticated: false,
      isLoading: true,
      sessionExpired: false,
    });
  });

  it("deve mostrar o aviso por cima da tela atual quando várias requisições recebem 401 durante o uso", async () => {
    vi.spyOn(authService, "getAuthenticatedUser").mockResolvedValueOnce(mockUser);
    const { result } = renderHook(() => useRequireAuth());
    await waitFor(() => expect(result.current.isAuthenticated).toBe(true));

    respondUnauthorized();
    await act(async () => {
      await Promise.allSettled([
        apiRequest("/dashboard"),
        apiRequest("/journeys/current/competencies"),
        apiRequest("/users/1/journeys"),
      ]);
    });

    // A tela continua montada por trás do aviso, sem redirecionar
    expect(result.current.sessionExpired).toBe(true);
    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.user).toEqual(mockUser);
    expect(routerReplaceMock).not.toHaveBeenCalled();
  });

  it("deve encerrar a sessão local e ir ao login guardando a página ao confirmar o aviso", async () => {
    vi.spyOn(authService, "getAuthenticatedUser").mockResolvedValueOnce(mockUser);
    const { result } = renderHook(() => useRequireAuth());
    await waitFor(() => expect(result.current.isAuthenticated).toBe(true));
    act(() => useAuthStore.getState().markSessionExpired());

    act(() => result.current.goToLogin());

    expect(useAuthStore.getState()).toMatchObject({
      user: null,
      isAuthenticated: false,
      sessionExpired: true,
    });
    expect(routerReplaceMock).toHaveBeenCalledTimes(1);
    expect(routerReplaceMock).toHaveBeenCalledWith("/login?reason=session_expired&redirect=%2Fjornadas");
    // Voltar depois sem entrar leva direto ao login, sem repetir o aviso
    expect(hadPreviousSession()).toBe(false);
  });

  it("deve ir ao login sem o aviso quando o usuário saiu em outra aba", async () => {
    vi.spyOn(authService, "getAuthenticatedUser").mockResolvedValueOnce(mockUser);
    const { result } = renderHook(() => useRequireAuth());
    await waitFor(() => expect(result.current.isAuthenticated).toBe(true));

    // O logout na outra aba remove a marca, compartilhada pelo localStorage
    window.localStorage.clear();
    respondUnauthorized();
    await act(async () => {
      await apiRequest("/dashboard").catch(() => undefined);
    });

    expect(result.current.sessionExpired).toBe(false);
    await waitFor(() => expect(routerReplaceMock).toHaveBeenCalledWith("/login"));
  });

  it("deve marcar a sessão como expirada, sem redirecionar, ao carregar com uma sessão anterior no navegador", async () => {
    markSessionStarted();
    mockMeUnauthorized();

    const { result } = renderHook(() => useRequireAuth());

    await waitFor(() => expect(result.current.sessionExpired).toBe(true));
    expect(result.current.isAuthenticated).toBe(false);
    expect(routerReplaceMock).not.toHaveBeenCalled();
  });

  it("deve ir direto ao login, sem o aviso, quando não havia sessão no navegador", async () => {
    mockMeUnauthorized();

    renderHook(() => useRequireAuth());

    await waitFor(() => expect(routerReplaceMock).toHaveBeenCalledWith("/login"));
    expect(useAuthStore.getState().sessionExpired).toBe(false);
  });

  it("deve marcar a sessão ao autenticar e remover a marca no logout", async () => {
    vi.spyOn(authService, "getAuthenticatedUser").mockResolvedValueOnce(mockUser);
    vi.spyOn(authService, "logout").mockResolvedValueOnce();
    const { result } = renderHook(() => useAuth());
    await waitFor(() => expect(result.current.isAuthenticated).toBe(true));
    expect(hadPreviousSession()).toBe(true);

    await act(async () => {
      await result.current.logout();
    });

    expect(hadPreviousSession()).toBe(false);
  });
});
