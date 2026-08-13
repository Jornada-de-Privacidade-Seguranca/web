"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/features/auth/auth.store";
import { getAuthenticatedUser, logout as logoutRequest } from "@/services/authService";

/**
 * Garante que a sessão atual (cookie httpOnly) seja conferida em /me uma
 * única vez, mesmo que várias telas montem useAuth() ao mesmo tempo.
 */
let sessionBootstrap: Promise<void> | null = null;

function bootstrapSession(): Promise<void> {
  if (!sessionBootstrap) {
    sessionBootstrap = getAuthenticatedUser()
      .then((user) => {
        useAuthStore.getState().setAuth(user);
      })
      .catch(() => {
        useAuthStore.getState().clearAuth();
      });
  }
  return sessionBootstrap;
}

/** Uso exclusivo dos testes: permite refazer o bootstrap da sessão a cada caso. */
export function resetAuthBootstrap(): void {
  sessionBootstrap = null;
}

export function useAuth() {
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isLoading = useAuthStore((state) => state.isLoading);
  const setAuth = useAuthStore((state) => state.setAuth);
  const clearAuth = useAuthStore((state) => state.clearAuth);

  useEffect(() => {
    void bootstrapSession();
  }, []);

  async function logout() {
    try {
      await logoutRequest();
    } finally {
      clearAuth();
    }
  }

  return {
    user,
    isAuthenticated,
    isLoading,
    setAuth,
    clearAuth,
    logout,
  };
}
