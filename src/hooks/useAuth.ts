"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/features/auth/auth.store";
import { getAuthenticatedUser, logout as logoutRequest } from "@/services/authService";
import { ApiRequestError, setUnauthorizedHandler } from "@/services/httpClient";
import { clearSessionMarker, hadPreviousSession } from "@/shared/utils/sessionMarker";

// Um 401 da API durante o uso mostra o aviso de sessão expirada por cima da tela
// atual. Várias requisições falhando juntas mostram o aviso uma única vez. Sem a
// marca de sessão, o usuário saiu em outra aba: a sessão foi encerrada, não
// expirou, e o layout leva direto ao login.
setUnauthorizedHandler(() => {
  const { isAuthenticated, markSessionExpired, clearAuth } = useAuthStore.getState();
  if (!isAuthenticated) return;
  if (hadPreviousSession()) {
    markSessionExpired();
  } else {
    clearAuth();
  }
});

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
      .catch((error: unknown) => {
        // 401 com uma sessão anterior no navegador: a sessão expirou. Sem ela,
        // é um acesso sem login, e o layout leva direto ao login.
        const isUnauthorized = error instanceof ApiRequestError && error.status === 401;
        if (isUnauthorized && hadPreviousSession()) {
          useAuthStore.getState().expireSession();
        } else {
          useAuthStore.getState().clearAuth();
        }
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
  const sessionExpired = useAuthStore((state) => state.sessionExpired);
  const setAuth = useAuthStore((state) => state.setAuth);
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const expireSession = useAuthStore((state) => state.expireSession);

  useEffect(() => {
    void bootstrapSession();
  }, []);

  async function logout() {
    try {
      await logoutRequest();
    } finally {
      clearSessionMarker();
      clearAuth();
    }
  }

  return {
    user,
    isAuthenticated,
    isLoading,
    sessionExpired,
    setAuth,
    clearAuth,
    expireSession,
    logout,
  };
}
