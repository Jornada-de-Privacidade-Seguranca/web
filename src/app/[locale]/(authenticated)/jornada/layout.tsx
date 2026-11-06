"use client";

import { useRequirePermission } from "@/hooks/useAuthGuard";
import type { PropsWithChildren } from "react";

/**
 * Layout de proteção para /jornada/*.
 * Exige a permissão `journeys.take`.
 * Usuários não autorizados são bloqueados e redirecionados para /painel?error=access_denied.
 */
export default function JornadaDetailLayout({ children }: PropsWithChildren) {
  const { hasAccess, isLoading, isAuthenticated } = useRequirePermission(
    "journeys.take",
    { redirectTo: "/painel?error=access_denied" }
  );

  if (isLoading || !isAuthenticated || !hasAccess) {
    return null;
  }

  return <>{children}</>;
}
