"use client";

import { useRequirePermission } from "@/hooks/useAuthGuard";
import type { PropsWithChildren } from "react";

/**
 * Layout de proteção para todas as rotas administrativas (/admin/*).
 * Exige pelo menos uma das permissões administrativas (`users.view` ou `results.view_all`).
 * Usuários não autorizados são bloqueados e redirecionados para /painel?error=access_denied.
 */
export default function AdminLayout({ children }: PropsWithChildren) {
  const { hasAccess, isLoading, isAuthenticated } = useRequirePermission(
    ["users.view", "results.view_all"],
    { mode: "any", redirectTo: "/painel?error=access_denied" }
  );

  if (isLoading || !isAuthenticated || !hasAccess) {
    return null;
  }

  return <>{children}</>;
}

