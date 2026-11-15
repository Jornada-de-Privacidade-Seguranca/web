"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import {
  ShieldIcon,
  DashboardSquare01Icon,
  Task01Icon,
  CheckListIcon,
  UserIcon,
  Shield01Icon,
  Logout03Icon,
} from "@hugeicons/core-free-icons";
import { Popover } from "radix-ui";
import { cn } from "@/shared/lib/utils";
import { useSidebarStore } from "@/store/sidebar.store";
import { useAuth } from "@/hooks/useAuth";
import { usePermission } from "@/hooks/usePermission";
import { useTranslations } from "next-intl";
import { KeyboardEvent, PropsWithChildren, useEffect, useRef } from "react";
import { usePathname } from "@/shared/i18n/navigation";
import { useIsMobile } from "@/hooks/useMobile";
import { SIDEBAR_ID } from "@/shared/constants/sidebar";
import { getInitials } from "@/shared/utils/initials";

export interface NavSubItem {
  label: string;
  href: string;
  active: boolean;
}

export interface NavItem {
  label: string;
  icon: typeof DashboardSquare01Icon;
  href: string;
  active: boolean;
  disabled?: boolean;
  subItems?: NavSubItem[];
}

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';

export function useSidebarVM() {
  const isDesktopExpanded = useSidebarStore((state) => state.isExpanded);
  const toggle = useSidebarStore((state) => state.toggle);
  const isMobileOpen = useSidebarStore((state) => state.isMobileOpen);
  const setMobileOpen = useSidebarStore((state) => state.setMobileOpen);
  const isMobile = useIsMobile();
  const { user: authUser, logout, sessionExpired } = useAuth();
  const { can, userProfileName } = usePermission();
  const t = useTranslations();
  const pathname = usePathname();
  const drawerRef = useRef<HTMLDivElement | null>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  // No drawer a barra sempre mostra os rótulos
  const isExpanded = isMobile || isDesktopExpanded;
  const isDrawerOpen = isMobile && isMobileOpen;

  // Ao passar para a largura de desktop, o drawer deixa de existir
  useEffect(() => {
    if (!isMobile) setMobileOpen(false);
  }, [isMobile, setMobileOpen]);

  // O aviso de sessão expirada é outro diálogo modal: o drawer fecha para não
  // disputar o foco com ele
  useEffect(() => {
    if (sessionExpired) setMobileOpen(false);
  }, [sessionExpired, setMobileOpen]);

  // Navegar fecha o drawer, inclusive pelo voltar do navegador
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname, setMobileOpen]);

  // Ao abrir, o foco vai para o drawer; ao fechar, volta para quem o abriu
  useEffect(() => {
    if (!isDrawerOpen) return;

    previousFocusRef.current = document.activeElement as HTMLElement | null;
    const getFocusableElements = () => {
      const drawerElements = drawerRef.current?.querySelectorAll<HTMLElement>(
        FOCUSABLE_SELECTOR
      );
      const portaledElements = Array.from(
        document.querySelectorAll<HTMLElement>(
          '[data-sidebar-dialog-focus][data-state="open"]'
        )
      ).flatMap((content) =>
        Array.from(content.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR))
      );

      return [...(drawerElements ?? []), ...portaledElements];
    };
    const focusFirstElement = () => {
      const firstFocusable = getFocusableElements()[0];
      (firstFocusable ?? drawerRef.current)?.focus();
    };
    const handleDocumentKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key !== "Tab") return;

      const focusables = getFocusableElements();
      if (focusables.length === 0) return;

      const activeIndex = focusables.indexOf(document.activeElement as HTMLElement);
      if (event.shiftKey && activeIndex <= 0) {
        event.preventDefault();
        focusables[focusables.length - 1].focus();
      } else if (!event.shiftKey && activeIndex === -1) {
        event.preventDefault();
        focusables[0].focus();
      } else if (!event.shiftKey && activeIndex === focusables.length - 1) {
        event.preventDefault();
        focusables[0].focus();
      }
    };
    const handleDocumentFocusIn = (event: FocusEvent) => {
      const target = event.target;
      if (!(target instanceof HTMLElement)) return;
      if (
        drawerRef.current?.contains(target) ||
        target.closest('[data-sidebar-dialog-focus][data-state="open"]')
      ) {
        return;
      }

      focusFirstElement();
    };

    document.addEventListener("keydown", handleDocumentKeyDown, true);
    document.addEventListener("focusin", handleDocumentFocusIn);
    focusFirstElement();

    return () => {
      document.removeEventListener("keydown", handleDocumentKeyDown, true);
      document.removeEventListener("focusin", handleDocumentFocusIn);
      previousFocusRef.current?.focus();
      previousFocusRef.current = null;
    };
  }, [isDrawerOpen]);

  function closeDrawer() {
    setMobileOpen(false);
  }

  /** Esc fecha o drawer. */
  function handleDrawerKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (isDrawerOpen && event.key === "Escape") {
      event.preventDefault();
      closeDrawer();
    }
  }

  function handleNavigate() {
    if (isMobile) closeDrawer();
  }

  async function handleLogout() {
    await logout();
  }

  const navItems: NavItem[] = [
    {
      label: t("sidebar.dashboard"),
      icon: DashboardSquare01Icon,
      href: "/painel",
      active: pathname.startsWith("/painel"),
    },
  ];

  // "Jornadas" só aparece com journeys.take
  if (can("journeys.take")) {
    navItems.push({
      label: t("sidebar.journeys"),
      icon: Task01Icon,
      href: "/jornadas",
      active:
        pathname.startsWith("/jornadas") ||
        pathname.startsWith("/jornada"),
      disabled: false,
    });
  }

  // "Resultados" só aparece com results.view_own
  if (can("results.view_own")) {
    navItems.push({
      label: t("sidebar.results"),
      icon: CheckListIcon,
      href: "/resultados",
      active: pathname.startsWith("/resultados"),
      disabled: false,
    });
  }

  // "Painel admin" aparece para quem tem users.view ou results.view_all
  if (can(["users.view", "results.view_all"])) {
    const adminSubItems: NavSubItem[] = [];

    // Subitem Usuários com users.view
    if (can("users.view")) {
      adminSubItems.push({
        label: t("sidebar.users"),
        href: "/admin/usuarios",
        active:
          pathname.startsWith("/admin/usuarios") ||
          pathname.startsWith("/admin/users"),
      });
    }

    // Subitem Resultados com results.view_all
    if (can("results.view_all")) {
      adminSubItems.push({
        label: t("sidebar.allResults"),
        href: "/admin/resultados",
        active: pathname.startsWith("/admin/resultados"),
      });
    }

    const defaultAdminHref = can("users.view")
      ? "/admin/usuarios"
      : "/admin/resultados";

    navItems.push({
      label: t("sidebar.admin-panel"),
      icon: Shield01Icon,
      href: defaultAdminHref,
      active: pathname.startsWith("/admin"),
      disabled: false,
      subItems: adminSubItems,
    });
  }

  // Perfil pessoal
  navItems.push({
    label: t("sidebar.profile"),
    icon: UserIcon,
    href: "/perfil",
    active: pathname.startsWith("/perfil") || pathname.startsWith("/profile"),
    disabled: false,
  });

  const user = {
    name: authUser?.name ?? "Usuário",
    role:
      userProfileName ||
      authUser?.profile?.name ||
      authUser?.profile?.label ||
      "",
    initials: authUser?.name ? getInitials(authUser.name) : "",
  };

  return {
    isExpanded,
    isMobile,
    isDrawerOpen,
    drawerRef,
    toggle,
    navItems,
    user,
    closeDrawer,
    handleDrawerKeyDown,
    handleNavigate,
    handleLogout,
    labels: {
      title: t("app.title"),
      description: t("app.description"),
      navTitle: t("sidebar.navigation"),
      drawerLabel: t("sidebar.drawerLabel"),
      profile: t("sidebar.userMenu.profile"),
      logout: t("sidebar.userMenu.logout"),
    },
  };
}

interface SidebarWrapperProps extends PropsWithChildren {
  isExpanded: boolean;
  isMobile: boolean;
  isDrawerOpen: boolean;
  drawerRef: React.RefObject<HTMLDivElement | null>;
  drawerLabel: string;
  onClose: () => void;
  onKeyDown: (event: KeyboardEvent<HTMLDivElement>) => void;
}

const SidebarWrapper = ({
  children,
  isExpanded,
  isMobile,
  isDrawerOpen,
  drawerRef,
  drawerLabel,
  onClose,
  onKeyDown,
}: SidebarWrapperProps) => {
  if (isMobile) {
    return (
      <>
        <div
          aria-hidden="true"
          data-testid="sidebar-backdrop"
          onClick={onClose}
          className={cn(
            "fixed inset-0 z-30 bg-black/50 transition-opacity duration-300 motion-reduce:transition-none",
            isDrawerOpen ? "opacity-100" : "pointer-events-none opacity-0",
          )}
        />
        <div
          ref={drawerRef}
          id={SIDEBAR_ID}
          role="dialog"
          aria-modal="true"
          aria-label={drawerLabel}
          inert={!isDrawerOpen}
          tabIndex={-1}
          onKeyDown={onKeyDown}
          className={cn(
            "fixed inset-y-0 left-0 z-40 w-64 outline-none transition-transform duration-300 ease-out motion-reduce:transition-none",
            isDrawerOpen ? "translate-x-0 shadow-xl" : "-translate-x-full",
          )}
          data-state={isDrawerOpen ? "open" : "closed"}
          data-variant="drawer"
        >
          {children}
        </div>
      </>
    );
  }

  return (
    <div
      id={SIDEBAR_ID}
      className={cn(
        // Escondida abaixo de `md` também pelo CSS: no primeiro render o hook
        // ainda indica desktop, e a barra fixa não chega a aparecer no celular
        "peer fixed inset-y-0 left-0 z-10 transition-[left,right,width] duration-300 ease-out max-md:hidden",
        isExpanded ? "w-64" : "w-18",
      )}
      data-state={isExpanded ? "expanded" : "collapsed"}
      data-variant="inset"
    >
      {children}
    </div>
  );
};

export const AuthenticatedUserSidebar = () => {
  const {
    isExpanded,
    isMobile,
    isDrawerOpen,
    drawerRef,
    navItems,
    user,
    labels,
    closeDrawer,
    handleDrawerKeyDown,
    handleNavigate,
    handleLogout,
  } = useSidebarVM();

  return (
    <SidebarWrapper
      isExpanded={isExpanded}
      isMobile={isMobile}
      isDrawerOpen={isDrawerOpen}
      drawerRef={drawerRef}
      drawerLabel={labels.drawerLabel}
      onClose={closeDrawer}
      onKeyDown={handleDrawerKeyDown}
    >
      <div
        className={cn(
          "flex h-full w-full flex-col border-r transition-[width] ease-in-out duration-300",
          "bg-sidebar-primary-foreground border-sidebar-border",
          isExpanded ? "w-64" : "w-18",
        )}
      >
        <div className="flex items-center gap-3 px-4 py-5 overflow-hidden">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary">
            <HugeiconsIcon icon={ShieldIcon} size={20} strokeWidth={1.5} />
          </div>
          <div
            className={cn(
              "min-w-0 transition-all duration-200",
              isExpanded ? "opacity-100 w-auto" : "w-0 opacity-0",
            )}
          >
            <p className="whitespace-nowrap text-sm font-semibold text-foreground">
              {labels.title}
            </p>
            <p className="whitespace-nowrap text-xs text-muted-foreground">
              {labels.description}
            </p>
          </div>
        </div>

        <nav className="flex-1 px-3 py-2">
          <p
            className={cn(
              "px-2 pb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground transition-opacity duration-200",
              isExpanded ? "opacity-100" : "opacity-0",
            )}
          >
            {labels.navTitle}
          </p>

          <ul className="space-y-1">
            {navItems.map((item) => {
              return (
                <li key={item.href} className="space-y-1">
                  <a
                    {...(!item.disabled && { href: item.href, onClick: handleNavigate })}
                    aria-disabled={item.disabled}
                    aria-current={item.active ? "page" : undefined}
                    title={!isExpanded ? item.label : undefined}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-2.5 py-2 text-sm transition-all",
                      item.active
                        ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                        : "text-sidebar-accent-foreground hover:bg-sidebar-accent",
                      "data-[state=collapsed]:gap-0 data-[state=collapsed]:w-max",
                      item.disabled && "cursor-not-allowed opacity-50",
                    )}
                    data-state={isExpanded ? "expanded" : "collapsed"}
                  >
                    <span className="shrink-0">
                      <HugeiconsIcon
                        icon={item.icon}
                        size={18}
                        strokeWidth={1.5}
                      />
                    </span>

                    <span
                      className={cn(
                        "whitespace-nowrap overflow-hidden transition-[opacity,width] duration-200 ease-in-out",
                        isExpanded ? "opacity-100 w-auto" : "w-0 opacity-0",
                      )}
                    >
                      {item.label}
                    </span>
                  </a>

                  {isExpanded && item.subItems && item.subItems.length > 0 && (
                    <ul className="ml-6 space-y-1 border-l border-sidebar-border/70 pl-2">
                      {item.subItems.map((subItem) => (
                        <li key={subItem.href}>
                          <a
                            href={subItem.href}
                            className={cn(
                              "flex items-center rounded-md px-2 py-1 text-xs transition-colors",
                              subItem.active
                                ? "bg-sidebar-accent/70 font-semibold text-primary"
                                : "text-muted-foreground hover:bg-sidebar-accent/50 hover:text-foreground",
                            )}
                          >
                            {subItem.label}
                          </a>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="border-t border-sidebar-border px-4 py-4">
          <Popover.Root>
            <Popover.Trigger asChild>
              <button
                type="button"
                className="flex w-full items-center gap-3 rounded-lg text-left outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-sidebar-accent text-xs font-medium text-shadow-sidebar-accent-foreground">
                  {user.initials}
                </div>
                <div
                  className={cn(
                    "min-w-0 transition-all duration-200",
                    isExpanded ? "opacity-100 w-auto" : "w-0 opacity-0",
                  )}
                >
                  <p className="whitespace-nowrap text-sm font-medium text-foreground">
                    {user.name}
                  </p>
                  <p className="whitespace-nowrap text-xs text-muted-foreground">
                    {user.role}
                  </p>
                </div>
              </button>
            </Popover.Trigger>

            <Popover.Portal>
              <Popover.Content
                side="top"
                align="start"
                sideOffset={8}
                data-sidebar-dialog-focus
                className="z-50 w-56 rounded-xl border border-sidebar-border bg-popover p-1.5 text-popover-foreground shadow-lg outline-none"
              >
                <button
                  type="button"
                  disabled
                  className="flex w-full cursor-not-allowed items-center gap-2 rounded-lg px-2.5 py-2 text-sm text-popover-foreground opacity-50"
                >
                  <HugeiconsIcon icon={UserIcon} size={18} strokeWidth={1.5} />
                  {labels.profile}
                </button>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-sm text-destructive transition-colors hover:bg-destructive/10"
                >
                  <HugeiconsIcon
                    icon={Logout03Icon}
                    size={18}
                    strokeWidth={1.5}
                  />
                  {labels.logout}
                </button>
              </Popover.Content>
            </Popover.Portal>
          </Popover.Root>
        </div>
      </div>
    </SidebarWrapper>
  );
};
