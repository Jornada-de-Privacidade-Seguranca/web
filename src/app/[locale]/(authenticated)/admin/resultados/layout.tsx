"use client";

import { useRequirePermission } from "@/hooks/useAuthGuard";
import type { PropsWithChildren } from "react";

/**
 * Garante que apenas usuários com a permissão `results.view_all` acessem /admin/resultados.
 */
export default function AdminResultadosLayout({ children }: PropsWithChildren) {
  const { hasAccess, isLoading, isAuthenticated } = useRequirePermission(
    "results.view_all",
    { redirectTo: "/painel?error=access_denied" }
  );

  if (isLoading || !isAuthenticated || !hasAccess) {
    return null;
  }

  return <>{children}</>;
}

