"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import { Button } from "../ui";
import { SidebarLeftIcon } from "@hugeicons/core-free-icons";
import { SwitchThemeButton } from "./SwitchThemeButton";
import { IdiomSwitch } from "./IdiomSwitch";
import { useSidebarStore } from "@/store/sidebar.store";
import { cn } from "@/shared/lib/utils";
import { useEffect, useRef, useState } from "react";

export interface PageShellProps {
  children: React.ReactNode;

  title: string;
  subtitle?: string;
}

export const PageShell = ({ children, title, subtitle }: PageShellProps) => {
  const toggleSidebar = useSidebarStore((state) => state.toggle);
  const isSidebarExpanded = useSidebarStore((state) => state.isExpanded);
  const headerRef = useRef<HTMLElement | null>(null);
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
          "fixed top-0 right-0 left-18 z-20 flex h-16 items-center gap-3 border-b border-border/60 bg-background/80 px-4 backdrop-blur md:px-8",
          isSidebarExpanded ? "left-64" : "left-18",
          "transition-[left] duration-300 ease-in-out",
        )}
      >
        <Button
          variant="ghost"
          size="icon"
          data-sidebar="trigger"
          onClick={toggleSidebar}
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
          <p className="truncate text-xs text-muted-foreground">{subtitle}</p>
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
