"use client";

import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "@/shared/i18n/navigation";

/** Redireciona para /login quando não houver sessão autenticada. */
export function useRequireAuth() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace("/login");
    }
  }, [isLoading, isAuthenticated, router]);

  return { user, isAuthenticated, isLoading };
}

/** Redireciona para /painel quando já houver uma sessão autenticada. */
export function useRequireGuest() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace("/painel");
    }
  }, [isLoading, isAuthenticated, router]);

  return { isAuthenticated, isLoading };
}
