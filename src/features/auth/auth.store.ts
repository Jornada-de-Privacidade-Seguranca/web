import { create } from "zustand";
import { markSessionStarted } from "@/shared/utils/sessionMarker";
import type { AuthenticatedUser } from "./auth.types";

export interface AuthState {
  user: AuthenticatedUser | null;
  isAuthenticated: boolean;
  /** true enquanto a sessão atual (cookie httpOnly) ainda não foi conferida via /me. */
  isLoading: boolean;
  /** true quando havia uma sessão no navegador e ela expirou, e não houve logout. */
  sessionExpired: boolean;
  /** Autentica o usuário e marca no navegador que há uma sessão (ver sessionMarker). */
  setAuth: (user: AuthenticatedUser) => void;
  clearAuth: () => void;
  /**
   * Avisa que a sessão expirou durante o uso, mantendo o usuário e a tela atual
   * por trás do aviso. Só tem efeito com o usuário autenticado.
   */
  markSessionExpired: () => void;
  /** Encerra a sessão local mantendo a informação de que ela expirou. */
  expireSession: () => void;
  setLoading: (isLoading: boolean) => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  sessionExpired: false,
  setAuth: (user: AuthenticatedUser) => {
    markSessionStarted();
    set({ user, isAuthenticated: true, isLoading: false, sessionExpired: false });
  },
  clearAuth: () =>
    set({ user: null, isAuthenticated: false, isLoading: false, sessionExpired: false }),
  markSessionExpired: () => {
    if (!get().isAuthenticated) return;
    set({ sessionExpired: true });
  },
  expireSession: () =>
    set({ user: null, isAuthenticated: false, isLoading: false, sessionExpired: true }),
  setLoading: (isLoading: boolean) => set({ isLoading }),
}));
