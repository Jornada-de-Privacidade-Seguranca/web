// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { AxiosError, type AxiosResponse, type InternalAxiosRequestConfig } from "axios";
import { useSessionTimeoutWarningVM } from "../sessionTimeoutWarning.viewmodel";
import { resetAuthBootstrap } from "@/hooks/useAuth";
import { useAuthStore } from "@features/auth/auth.store";
import { useSidebarStore } from "@/store/sidebar.store";
import * as authService from "@services/authService";
import { axiosInstance } from "@services/httpClient";
import { markSessionStarted } from "@/shared/utils/sessionMarker";
import {
  recordSessionActivity,
  resetSessionActivity,
} from "@/shared/utils/sessionActivity";
import type { AuthenticatedUser } from "@features/auth/auth.types";

vi.mock("next-intl", () => ({
  useTranslations: (namespace?: string) => (key: string, values?: Record<string, unknown>) =>
    `${namespace}.${key}${values ? ` ${JSON.stringify(values)}` : ""}`,
}));

const LAST_ACTIVITY_KEY = "jornada:session-last-activity";
const MINUTE = 60 * 1000;
const T0 = Date.parse("2026-11-06T10:00:00Z");

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

const originalAdapter = axiosInstance.defaults.adapter;
const adapter = vi.fn();

/** Responde pelo adaptador, para que a resposta passe pelos interceptadores do httpClient. */
function respondWith(status: number, data: unknown) {
  adapter.mockImplementation(async (config: InternalAxiosRequestConfig) => {
    const response = { data, status, statusText: "", headers: {}, config };
    if (status >= 400) {
      throw new AxiosError("Request failed", "ERR_BAD_REQUEST", config, undefined, response as AxiosResponse);
    }
    return response as AxiosResponse;
  });
}

function respondWithNetworkError() {
  adapter.mockImplementation(async (config: InternalAxiosRequestConfig) => {
    throw new AxiosError("Network Error", "ERR_NETWORK", config);
  });
}

function advance(ms: number) {
  act(() => {
    vi.advanceTimersByTime(ms);
  });
}

function renderWarning() {
  return renderHook(() => useSessionTimeoutWarningVM());
}

describe("useSessionTimeoutWarningVM", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(T0);
    vi.restoreAllMocks();
    adapter.mockReset();
    axiosInstance.defaults.adapter = adapter;
    resetAuthBootstrap();
    vi.spyOn(authService, "getAuthenticatedUser").mockResolvedValue(mockUser);
    window.localStorage.clear();
    resetSessionActivity();
    markSessionStarted();
    useAuthStore.setState({
      user: mockUser,
      isAuthenticated: true,
      isLoading: false,
      sessionExpired: false,
    });
    useSidebarStore.setState({ isMobileOpen: false });
    // Login às 10:00, com sessão de 120 minutos
    recordSessionActivity(120, T0);
  });

  afterEach(() => {
    vi.useRealTimers();
    axiosInstance.defaults.adapter = originalAdapter;
  });

  it("deve abrir o aviso quando faltam 5 minutos, sem chamar a API", () => {
    const { result } = renderWarning();

    advance(115 * MINUTE - 1);
    expect(result.current.isOpen).toBe(false);

    advance(1);
    expect(result.current.isOpen).toBe(true);
    expect(result.current.labels.countdown).toBe('sessionWarning.countdown {"time":"05:00"}');
    expect(adapter).not.toHaveBeenCalled();
  });

  it("deve contar os segundos na tela e anunciar o tempo só a cada minuto", () => {
    const { result } = renderWarning();
    advance(115 * MINUTE);

    advance(1000);
    expect(result.current.labels.countdown).toBe('sessionWarning.countdown {"time":"04:59"}');
    expect(result.current.labels.announcement).toBe('sessionWarning.announcement {"minutes":5}');

    advance(58 * 1000);
    expect(result.current.labels.countdown).toBe('sessionWarning.countdown {"time":"04:01"}');
    expect(result.current.labels.announcement).toBe('sessionWarning.announcement {"minutes":5}');

    advance(1000);
    expect(result.current.labels.countdown).toBe('sessionWarning.countdown {"time":"04:00"}');
    expect(result.current.labels.announcement).toBe('sessionWarning.announcement {"minutes":4}');
  });

  it("deve renovar a sessão com GET /me e fechar o aviso ao continuar conectado", async () => {
    const { result } = renderWarning();
    advance(117 * MINUTE);
    expect(result.current.isOpen).toBe(true);
    respondWith(200, { success: true, data: mockUser, meta: { session: { lifetime_minutes: 120 } } });

    await act(async () => {
      await result.current.handleRenew();
    });

    expect(adapter).toHaveBeenCalledTimes(1);
    expect(adapter.mock.calls[0][0]).toMatchObject({ url: "/me", method: "get" });
    expect(result.current.isOpen).toBe(false);

    // A contagem recomeça da renovação: o próximo aviso vem 115 minutos depois dela
    advance(115 * MINUTE - 1);
    expect(result.current.isOpen).toBe(false);
    advance(1);
    expect(result.current.isOpen).toBe(true);
  });

  it("deve seguir o fluxo de sessão expirada quando a renovação recebe 401", async () => {
    const { result } = renderWarning();
    advance(117 * MINUTE);
    respondWith(401, { success: false, message: "Usuario nao autenticado.", code: "UNAUTHENTICATED" });

    await act(async () => {
      await result.current.handleRenew();
    });

    expect(useAuthStore.getState().sessionExpired).toBe(true);
    expect(result.current.isOpen).toBe(false);
    expect(result.current.labels.renewError).toBeUndefined();
  });

  it("deve manter o aviso aberto com uma mensagem de erro quando a renovação falha", async () => {
    const { result } = renderWarning();
    advance(117 * MINUTE);
    respondWithNetworkError();

    await act(async () => {
      await result.current.handleRenew();
    });

    expect(result.current.isOpen).toBe(true);
    expect(result.current.isRenewing).toBe(false);
    expect(result.current.labels.renewError).toBe("sessionWarning.renewError");
    expect(useAuthStore.getState().sessionExpired).toBe(false);
  });

  it("deve seguir o fluxo de sessão expirada quando a contagem chega a zero, sem esperar um 401", () => {
    const { result } = renderWarning();

    advance(120 * MINUTE - 1);
    expect(useAuthStore.getState().sessionExpired).toBe(false);

    advance(1);
    expect(useAuthStore.getState().sessionExpired).toBe(true);
    expect(useAuthStore.getState().isAuthenticated).toBe(true);
    expect(result.current.isOpen).toBe(false);
    expect(adapter).not.toHaveBeenCalled();
  });

  it("deve ir direto ao login quando a contagem chega a zero depois de um logout em outra aba", () => {
    renderWarning();
    // O logout na outra aba remove a marca de sessão
    window.localStorage.removeItem("jornada:had-session");

    advance(120 * MINUTE);

    expect(useAuthStore.getState()).toMatchObject({ isAuthenticated: false, sessionExpired: false });
  });

  it("deve encerrar a sessão com POST /auth/logout ao sair", async () => {
    const logoutSpy = vi.spyOn(authService, "logout").mockResolvedValueOnce();
    const { result } = renderWarning();
    advance(117 * MINUTE);

    await act(async () => {
      await result.current.handleLogout();
    });

    expect(logoutSpy).toHaveBeenCalledTimes(1);
    expect(useAuthStore.getState()).toMatchObject({ isAuthenticated: false, sessionExpired: false });
    expect(result.current.isOpen).toBe(false);
  });

  it("deve encerrar a sessão local ao sair mesmo sem resposta do backend", async () => {
    vi.spyOn(authService, "logout").mockRejectedValueOnce(new Error("Network Error"));
    const { result } = renderWarning();
    advance(117 * MINUTE);

    await act(async () => {
      await result.current.handleLogout();
    });

    expect(useAuthStore.getState().isAuthenticated).toBe(false);
  });

  it("não deve avisar quando a sessão foi usada em outra aba", () => {
    const { result } = renderWarning();
    advance(110 * MINUTE);

    // Outra aba recebe uma resposta da API às 11:50
    act(() => {
      const otherTabActivity = String(T0 + 110 * MINUTE);
      window.localStorage.setItem(LAST_ACTIVITY_KEY, otherTabActivity);
      window.dispatchEvent(
        new StorageEvent("storage", { key: LAST_ACTIVITY_KEY, newValue: otherTabActivity })
      );
    });

    advance(10 * MINUTE);
    expect(result.current.isOpen).toBe(false);
    expect(useAuthStore.getState().sessionExpired).toBe(false);
  });

  it("deve fechar o aviso quando a sessão é renovada em outra aba", () => {
    const { result } = renderWarning();
    advance(117 * MINUTE);
    expect(result.current.isOpen).toBe(true);

    act(() => {
      const otherTabActivity = String(Date.now());
      window.localStorage.setItem(LAST_ACTIVITY_KEY, otherTabActivity);
      window.dispatchEvent(
        new StorageEvent("storage", { key: LAST_ACTIVITY_KEY, newValue: otherTabActivity })
      );
    });

    expect(result.current.isOpen).toBe(false);
  });

  it("não deve avisar antes de conhecer o tempo de vida da sessão", () => {
    resetSessionActivity();
    window.localStorage.clear();
    markSessionStarted();
    recordSessionActivity(undefined, T0);
    const { result } = renderWarning();

    advance(200 * MINUTE);

    expect(result.current.isOpen).toBe(false);
    expect(useAuthStore.getState().sessionExpired).toBe(false);
  });

  it("não deve avisar depois que a sessão já expirou", () => {
    const { result } = renderWarning();
    act(() => useAuthStore.getState().markSessionExpired());

    advance(117 * MINUTE);

    expect(result.current.isOpen).toBe(false);
  });

  it("deve fechar o drawer do celular ao abrir o aviso", () => {
    renderWarning();
    act(() => useSidebarStore.setState({ isMobileOpen: true }));

    advance(115 * MINUTE);

    expect(useSidebarStore.getState().isMobileOpen).toBe(false);
  });
});
