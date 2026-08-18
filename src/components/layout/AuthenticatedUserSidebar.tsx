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
import { useTranslations } from "next-intl";
import { PropsWithChildren } from "react";
import { usePathname } from "@/shared/i18n/navigation";

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function useSidebarVM() {
  const isExpanded = useSidebarStore((state) => state.isExpanded);
  const toggle = useSidebarStore((state) => state.toggle);
  const { user: authUser, logout } = useAuth();
  const t = useTranslations();
  const pathname = usePathname();

  async function handleLogout() {
    await logout();
  }

  const navItems = [
    {
      label: t("sidebar.dashboard"),
      icon: DashboardSquare01Icon,
      href: "/painel",
      active: pathname.startsWith("/painel"),
    },
    {
      label: t("sidebar.journeys"),
      icon: Task01Icon,
      href: "/jornadas",
      active:
        pathname.startsWith("/jornadas") ||
        pathname.startsWith("/assessments") ||
        pathname.startsWith("/avaliacoes"),
      disabled: false,
    },
    {
      label: t("sidebar.results"),
      icon: CheckListIcon,
      href: "/results",
      active:
        pathname.startsWith("/results") || pathname.startsWith("/resultados"),
      disabled: false,
    },
    {
      label: t("sidebar.profile"),
      icon: UserIcon,
      href: "/perfil",
      active: false,
      disabled: true,
    },
    {
      label: t("sidebar.admin-panel"),
      icon: Shield01Icon,
      href: "/admin",
      active: false,
      disabled: true,
    },
  ];

  const user = {
    name: authUser?.name ?? "Usuário",
    role: authUser?.profile.label ?? "",
    initials: authUser?.name ? getInitials(authUser.name) : "",
  };

  return {
    isExpanded,
    toggle,
    navItems,
    user,
    handleLogout,
    labels: {
      title: t("app.title"),
      description: t("app.description"),
      navTitle: t("sidebar.navigation"),
      profile: t("sidebar.userMenu.profile"),
      logout: t("sidebar.userMenu.logout"),
    },
  };
}

const SidebarWrapper = ({ children }: PropsWithChildren) => {
  const { isExpanded } = useSidebarStore();

  return (
    <div
      className={cn(
        "peer fixed inset-y-0 left-0 z-10 transition-[left,right,width] duration-300 ease-out",
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
  const { isExpanded, navItems, user, labels, handleLogout } =
    useSidebarVM();

  return (
    <SidebarWrapper>
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
                <li key={item.href}>
                  <a
                    {...(!item.disabled && { href: item.href })}
                    aria-disabled={item.disabled}
                    title={!isExpanded ? item.label : undefined}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-2.5 py-2 text-sm transition-all",
                      item.active
                        ? "bg-sidebar-accent text-sidebar-accent-foreground"
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
