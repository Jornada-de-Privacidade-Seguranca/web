"use client";

import { useRequirePermission } from "@/hooks/useAuthGuard";
import type { PropsWithChildren } from "react";

/**
 * Layout de proteção para /jornadas.
 * Exige a permissão `journeys.take`.
 * Usuários não autorizados são bloqueados e redirecionados para /painel?error=access_denied.
 */
export default function JornadasLayout({ children }: PropsWithChildren) {
  const { hasAccess, isLoading, isAuthenticated } = useRequirePermission(
    "journeys.take",
    { redirectTo: "/painel?error=access_denied" }
  );

  if (isLoading || !isAuthenticated || !hasAccess) {
    return null;
  }

  return <>{children}</>;
}
