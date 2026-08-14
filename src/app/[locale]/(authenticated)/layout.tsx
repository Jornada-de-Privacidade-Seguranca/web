"use client";

import { AuthenticatedUserSidebar } from "@/components/layout/AuthenticatedUserSidebar";
import { cn } from "@/shared/lib/utils";
import { PropsWithChildren } from "react";

export default function AuthenticatedLayout({ children }: PropsWithChildren) {
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
    </div>
  );
}
