"use client";

import { AuthenticatedUserSidebar } from "@/components/layout/AuthenticatedUserSidebar";
import { cn } from "@/shared/lib/utils";
import { useRequireAuth } from "@/hooks/useAuthGuard";
import { useSidebarStore } from "@/store/sidebar.store";
import { PropsWithChildren } from "react";

export default function AuthenticatedLayout({ children }: PropsWithChildren) {
  const { isLoading, isAuthenticated } = useRequireAuth();
  const isDrawerOpen = useSidebarStore((state) => state.isMobileOpen);

  if (isLoading || !isAuthenticated) {
    return null;
  }

  return (
    <div className="relative flex h-screen w-screen overflow-hidden bg-background">
      <AuthenticatedUserSidebar />

      <main
        className={cn(
          "relative flex h-full min-w-0 flex-1 flex-col overflow-y-auto bg-background",
          // Abaixo de `md` a barra vira drawer sobreposto e o conteúdo ocupa a largura toda
          "pl-0 md:pl-64",
          "md:peer-data-[state=collapsed]:pl-18 md:peer-data-[state=expanded]:pl-64 transition-[padding-left] duration-300 ease-in-out",
          // Com o drawer aberto, o conteúdo por trás não rola
          isDrawerOpen && "max-md:overflow-hidden",
        )}
      >
        {children}
      </main>
    </div>
  );
}
