"use client";

import { useRequirePermission } from "@/hooks/useAuthGuard";
import type { PropsWithChildren } from "react";

/**
 * Guarda de rota para /admin/usuarios/novo.
 * Restringe o acesso exclusivamente a quem possui a permissão `users.register`.
 */
export default function AdminUsuarioNovoLayout({ children }: PropsWithChildren) {
  const { hasAccess, isLoading, isAuthenticated } = useRequirePermission(
    "users.register",
    { redirectTo: "/painel?error=access_denied" }
  );

  if (isLoading || !isAuthenticated || !hasAccess) {
    return null;
  }

  return <>{children}</>;
}
