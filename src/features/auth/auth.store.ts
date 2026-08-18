import { create } from "zustand";
import type { AuthenticatedUser } from "./auth.types";

export interface AuthState {
  user: AuthenticatedUser | null;
  isAuthenticated: boolean;
  /** true enquanto a sessão atual (cookie httpOnly) ainda não foi conferida via /me. */
  isLoading: boolean;
  setAuth: (user: AuthenticatedUser) => void;
  clearAuth: () => void;
  setLoading: (isLoading: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  setAuth: (user: AuthenticatedUser) =>
    set({ user, isAuthenticated: true, isLoading: false }),
  clearAuth: () =>
    set({ user: null, isAuthenticated: false, isLoading: false }),
  setLoading: (isLoading: boolean) => set({ isLoading }),
}));
