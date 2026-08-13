// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";
import { useAuth, resetAuthBootstrap } from "../useAuth";
import { useAuthStore } from "@features/auth/auth.store";
import * as authService from "@services/authService";
import type { AuthenticatedUser } from "@features/auth/auth.types";

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

describe("useAuth", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    resetAuthBootstrap();
    useAuthStore.setState({ user: null, isAuthenticated: false, isLoading: true });
  });

  it("should hydrate the session from /me when it succeeds", async () => {
    vi.spyOn(authService, "getAuthenticatedUser").mockResolvedValueOnce(mockUser);

    const { result } = renderHook(() => useAuth());

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.user).toEqual(mockUser);
  });

  it("should clear the session when /me fails (no active session)", async () => {
    vi.spyOn(authService, "getAuthenticatedUser").mockRejectedValueOnce(
      new Error("Usuario nao autenticado.")
    );

    const { result } = renderHook(() => useAuth());

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.user).toBeNull();
  });

  it("should only call /me once even when multiple components use the hook", async () => {
    const getAuthenticatedUserSpy = vi
      .spyOn(authService, "getAuthenticatedUser")
      .mockResolvedValue(mockUser);

    renderHook(() => useAuth());
    renderHook(() => useAuth());

    await waitFor(() => expect(useAuthStore.getState().isLoading).toBe(false));

    expect(getAuthenticatedUserSpy).toHaveBeenCalledTimes(1);
  });

  it("should call the logout endpoint and clear local state, even if the request fails", async () => {
    vi.spyOn(authService, "getAuthenticatedUser").mockResolvedValueOnce(mockUser);
    const logoutSpy = vi
      .spyOn(authService, "logout")
      .mockRejectedValueOnce(new Error("Erro de rede."));

    const { result } = renderHook(() => useAuth());
    await waitFor(() => expect(result.current.isAuthenticated).toBe(true));

    await act(async () => {
      await expect(result.current.logout()).rejects.toThrow();
    });

    expect(logoutSpy).toHaveBeenCalledTimes(1);
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.user).toBeNull();
  });
});
