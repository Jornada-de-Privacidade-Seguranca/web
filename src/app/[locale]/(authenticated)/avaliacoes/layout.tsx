"use client";

import { useRequirePermission } from "@/hooks/useAuthGuard";
import type { PropsWithChildren } from "react";

export default function AvaliacoesLayout({ children }: PropsWithChildren) {
  const { hasAccess, isLoading, isAuthenticated } = useRequirePermission(
    "journeys.take",
    { redirectTo: "/painel?error=access_denied" }
  );

  if (isLoading || !isAuthenticated || !hasAccess) {
    return null;
  }

  return <>{children}</>;
}

