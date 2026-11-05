"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import { Button } from "../ui";
import { SidebarLeftIcon } from "@hugeicons/core-free-icons";
import { SwitchThemeButton } from "./SwitchThemeButton";
import { IdiomSwitch } from "./IdiomSwitch";
import { SIDEBAR_ID } from "@/shared/constants/sidebar";
import { useSidebarStore } from "@/store/sidebar.store";
import { useIsMobile } from "@/hooks/useMobile";
import { cn } from "@/shared/lib/utils";
import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";

export interface PageShellProps {
  children: React.ReactNode;

  title: string;
  subtitle?: string;
}

export const PageShell = ({ children, title, subtitle }: PageShellProps) => {
  const toggleSidebar = useSidebarStore((state) => state.toggle);
  const isSidebarExpanded = useSidebarStore((state) => state.isExpanded);
  const toggleMobileSidebar = useSidebarStore((state) => state.toggleMobile);
  const isMobileSidebarOpen = useSidebarStore((state) => state.isMobileOpen);
  const isMobile = useIsMobile();
  const t = useTranslations("sidebar.toggle");
  const headerRef = useRef<HTMLElement | null>(null);

  // Abaixo de `md` o botão abre o drawer; a partir dele, expande/recolhe a barra
  const isSidebarOpen = isMobile ? isMobileSidebarOpen : isSidebarExpanded;
  const handleToggleSidebar = isMobile ? toggleMobileSidebar : toggleSidebar;
  const [headerHeight, setHeaderHeight] = useState(0);

  useEffect(() => {
    const headerElement = headerRef.current;

    if (!headerElement) {
      return;
    }

    const updateHeaderHeight = () => {
      setHeaderHeight(headerElement.offsetHeight);
    };

    updateHeaderHeight();

    const observer = new ResizeObserver(updateHeaderHeight);
    observer.observe(headerElement);

    return () => observer.disconnect();
  }, []);

  return (
    <div
      className="flex h-screen w-full flex-col"
      style={{
        "--header-height": `${headerHeight}px`,
      } as React.CSSProperties}
    >
      <header
        ref={headerRef}
        className={cn(
          "fixed top-0 right-0 left-0 z-20 flex h-16 items-center gap-3 border-b border-border/60 bg-background/80 px-4 backdrop-blur md:px-8",
          isSidebarExpanded ? "md:left-64" : "md:left-18",
          "transition-[left] duration-300 ease-in-out",
        )}
      >
        <Button
          variant="ghost"
          size="icon"
          data-sidebar="trigger"
          aria-label={isSidebarOpen ? t("close") : t("open")}
          aria-expanded={isSidebarOpen}
          aria-controls={SIDEBAR_ID}
          onClick={handleToggleSidebar}
        >
          <HugeiconsIcon icon={SidebarLeftIcon} />
        </Button>
        <div className="flex min-w-0 flex-1 flex-col">
          <h1
            title={title}
            className="truncate font-display text-base font-semibold text-foreground md:text-lg"
          >
            {title}
          </h1>
        </div>
        {subtitle && (
          // Em telas pequenas o subtítulo some, para o título não ser espremido
          <p className="hidden min-w-0 max-w-[40%] truncate text-xs text-muted-foreground sm:block">
            {subtitle}
          </p>
        )}

        <div className="ml-auto flex items-center space-x-2">
          <IdiomSwitch />
          <SwitchThemeButton />
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 pb-8 pt-[calc(var(--header-height)+2rem)] md:px-8 md:pb-12 md:pt-[calc(var(--header-height)+2rem)]">
        {children}
      </main>
    </div>
  );
};
