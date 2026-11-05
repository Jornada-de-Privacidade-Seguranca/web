"use client";

import { AuthenticatedUserSidebar } from "@/components/layout/AuthenticatedUserSidebar";
import { SessionExpiredDialog } from "@/components/layout/SessionExpiredDialog";
import { cn } from "@/shared/lib/utils";
import { useRequireAuth } from "@/hooks/useAuthGuard";
import { PropsWithChildren } from "react";

export default function AuthenticatedLayout({ children }: PropsWithChildren) {
  const { isLoading, isAuthenticated, sessionExpired, goToLogin } = useRequireAuth();

  // Sessão expirada ao carregar a página: página vazia com o aviso
  if (sessionExpired && !isAuthenticated) {
    return <SessionExpiredDialog onConfirm={goToLogin} />;
  }

  if (isLoading || !isAuthenticated) {
    return null;
  }

  return (
    <div className="relative flex h-screen w-screen overflow-hidden bg-background">
      <AuthenticatedUserSidebar />

      <main
        className={cn(
          "relative flex h-full min-w-0 flex-1 flex-col overflow-y-auto bg-background",
          "pl-18 md:pl-64",
          "peer-data-[state=collapsed]:pl-18 peer-data-[state=expanded]:pl-64 transition-[padding-left] duration-300 ease-in-out",
        )}
      >
        {children}
      </main>

      {/* Sessão expirada durante o uso: o aviso fica por cima da tela atual */}
      {sessionExpired && <SessionExpiredDialog onConfirm={goToLogin} />}
    </div>
  );
}
