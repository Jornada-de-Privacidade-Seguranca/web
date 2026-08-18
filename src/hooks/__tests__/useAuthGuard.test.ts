// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook } from "@testing-library/react";
import { useRequireAuth, useRequireGuest } from "../useAuthGuard";
import * as useAuthModule from "../useAuth";

const routerReplaceMock = vi.fn();

vi.mock("@/shared/i18n/navigation", () => ({
  useRouter: () => ({ replace: routerReplaceMock }),
}));

function mockUseAuth(overrides: Partial<ReturnType<typeof useAuthModule.useAuth>>) {
  vi.spyOn(useAuthModule, "useAuth").mockReturnValue({
    user: null,
    isAuthenticated: false,
    isLoading: false,
    setAuth: vi.fn(),
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

  it("should not redirect when there is no authenticated session", () => {
    mockUseAuth({ isLoading: false, isAuthenticated: false });

    renderHook(() => useRequireGuest());

    expect(routerReplaceMock).not.toHaveBeenCalled();
  });
});
