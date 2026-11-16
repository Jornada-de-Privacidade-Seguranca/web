// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook } from "@testing-library/react";
import { useRequireAuth, useRequireGuest } from "../useAuthGuard";
import * as useAuthModule from "../useAuth";

const routerReplaceMock = vi.fn();

vi.mock("@/shared/i18n/navigation", () => ({
  useRouter: () => ({ replace: routerReplaceMock }),
  usePathname: () => "/jornadas",
}));

function mockUseAuth(overrides: Partial<ReturnType<typeof useAuthModule.useAuth>>) {
  vi.spyOn(useAuthModule, "useAuth").mockReturnValue({
    user: null,
    isAuthenticated: false,
    isLoading: false,
    sessionExpired: false,
    setAuth: vi.fn(),
    expireSession: vi.fn(),
    clearAuth: vi.fn(),
    logout: vi.fn(),
    ...overrides,
  });
}

describe("useRequireAuth", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    routerReplaceMock.mockClear();
  });

  it("should not redirect while the session is still loading", () => {
    mockUseAuth({ isLoading: true, isAuthenticated: false });

    renderHook(() => useRequireAuth());

    expect(routerReplaceMock).not.toHaveBeenCalled();
  });

  it("should redirect to /login when there is no authenticated session", () => {
    mockUseAuth({ isLoading: false, isAuthenticated: false });

    renderHook(() => useRequireAuth());

    expect(routerReplaceMock).toHaveBeenCalledWith("/login");
  });

  it("should not redirect when the user is authenticated", () => {
    mockUseAuth({ isLoading: false, isAuthenticated: true });

    renderHook(() => useRequireAuth());

    expect(routerReplaceMock).not.toHaveBeenCalled();
  });
  it("should not redirect by itself when the session expired, leaving it to the notice", () => {
    mockUseAuth({ isLoading: false, isAuthenticated: false, sessionExpired: true });

    const { result } = renderHook(() => useRequireAuth());

    expect(routerReplaceMock).not.toHaveBeenCalled();
    expect(result.current.sessionExpired).toBe(true);
  });

  it("should go to /login with the reason and the current page when goToLogin is called", () => {
    window.history.replaceState(null, "", "/pt/jornadas?page=2");
    mockUseAuth({ isLoading: false, isAuthenticated: false, sessionExpired: true });

    const { result } = renderHook(() => useRequireAuth());
    result.current.goToLogin();

    expect(routerReplaceMock).toHaveBeenCalledWith("/login?reason=session_expired&redirect=%2Fjornadas%3Fpage%3D2");
    window.history.replaceState(null, "", "/");
  });
});

describe("useRequireGuest", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    routerReplaceMock.mockClear();
  });

  it("should not redirect while the session is still loading", () => {
    mockUseAuth({ isLoading: true, isAuthenticated: false });

    renderHook(() => useRequireGuest());

    expect(routerReplaceMock).not.toHaveBeenCalled();
  });

  it("should redirect to /painel when the user is already authenticated", () => {
    mockUseAuth({ isLoading: false, isAuthenticated: true });

    renderHook(() => useRequireGuest());

    expect(routerReplaceMock).toHaveBeenCalledWith("/painel");
  });

  it("should not redirect an authenticated user when the guard is disabled", () => {
    mockUseAuth({ isLoading: false, isAuthenticated: true });

    renderHook(() => useRequireGuest({ enabled: false }));

    expect(routerReplaceMock).not.toHaveBeenCalled();
  });

  it("should not redirect when there is no authenticated session", () => {
    mockUseAuth({ isLoading: false, isAuthenticated: false });

    renderHook(() => useRequireGuest());

    expect(routerReplaceMock).not.toHaveBeenCalled();
  });
  it("should return to the page given in the login URL after authenticating", () => {
    window.history.replaceState(null, "", "/pt/login?redirect=%2Fresultados");
    mockUseAuth({ isLoading: false, isAuthenticated: true });

    renderHook(() => useRequireGuest());

    expect(routerReplaceMock).toHaveBeenCalledWith("/resultados");
    window.history.replaceState(null, "", "/");
  });

  it("should ignore an external redirect and go to /painel", () => {
    window.history.replaceState(null, "", "/pt/login?redirect=https%3A%2F%2Fsite-malicioso.com");
    mockUseAuth({ isLoading: false, isAuthenticated: true });

    renderHook(() => useRequireGuest());

    expect(routerReplaceMock).toHaveBeenCalledWith("/painel");
    window.history.replaceState(null, "", "/");
  });
});
