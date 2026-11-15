// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { describe, it, expect, beforeEach, vi } from "vitest";
import React from "react";
import { AuthenticatedUserSidebar } from "../AuthenticatedUserSidebar";
import { useAuthStore } from "@/features/auth/auth.store";
import { useSidebarStore } from "@/store/sidebar.store";
import { PERMISSIONS_BY_PROFILE } from "@/services/authService";
import type { AuthenticatedUser } from "@/features/auth/auth.types";

let mockPathname = "/painel";

vi.mock("@/shared/i18n/navigation", () => ({
  usePathname: () => mockPathname,
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
  Link: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

vi.mock("next-intl", () => ({
  useTranslations: () => {
    const messages: Record<string, string> = {
      "app.title": "Privacy Compass",
      "app.description": "Plataforma de Capacitação",
      "sidebar.navigation": "Navegação",
      "sidebar.dashboard": "Painel",
      "sidebar.journeys": "Jornadas",
      "sidebar.results": "Resultados",
      "sidebar.profile": "Perfil",
      "sidebar.admin-panel": "Painel administrativo",
      "sidebar.users": "Usuários",
      "sidebar.allResults": "Resultados da Organização",
      "sidebar.roleAdmin": "Administrador",
      "sidebar.roleUser": "Usuário",
    };
    return (key: string) => messages[key] || key;
  },
}));

vi.mock("@/hooks/useMobile", () => ({
  useIsMobile: () => false,
}));

describe("AuthenticatedUserSidebar - Permissões", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    mockPathname = "/painel";
    useSidebarStore.setState({ isExpanded: true, isMobileOpen: false });
  });

  it("deve renderizar todos os menus para Administrador", () => {
    const adminUser: AuthenticatedUser = {
      id: 1,
      name: "Carlos Admin",
      email: "carlos@empresa.com",
      role: "administrator",
      permissions: PERMISSIONS_BY_PROFILE.administrator,
      profile: {
        id: "admin",
        name: "Administrador",
        label: "Administrador",
        role: "administrator",
        user_type_id: 1,
        profile_type_id: 1,
        profile_type_name: "Administrador",
        permissions: PERMISSIONS_BY_PROFILE.administrator,
      },
      active_status: 1,
    };

    useAuthStore.getState().setAuth(adminUser);

    render(<AuthenticatedUserSidebar />);

    expect(screen.getByText("Painel")).toBeDefined();
    expect(screen.getByText("Jornadas")).toBeDefined();
    expect(screen.getByText("Resultados")).toBeDefined();
    expect(screen.getByText("Painel administrativo")).toBeDefined();
    expect(screen.getByText("Usuários")).toBeDefined();
    expect(screen.getByText("Resultados da Organização")).toBeDefined();
    expect(screen.getByText("Carlos Admin")).toBeDefined();
    expect(screen.getByText("Administrador")).toBeDefined();
  });

  it("deve renderizar menus para Gestor (Painel admin com Usuários e Resultados)", () => {
    const managerUser: AuthenticatedUser = {
      id: 2,
      name: "Juliana Gestora",
      email: "juliana@empresa.com",
      role: "administrator",
      permissions: PERMISSIONS_BY_PROFILE.manager,
      profile: {
        id: "manager",
        name: "Gestor",
        label: "Gestor",
        role: "administrator",
        user_type_id: 2,
        profile_type_id: 2,
        profile_type_name: "Gestor",
        permissions: PERMISSIONS_BY_PROFILE.manager,
      },
      active_status: 1,
    };

    useAuthStore.getState().setAuth(managerUser);

    render(<AuthenticatedUserSidebar />);

    expect(screen.getByText("Painel")).toBeDefined();
    expect(screen.getByText("Jornadas")).toBeDefined();
    expect(screen.getByText("Resultados")).toBeDefined();
    expect(screen.getByText("Painel administrativo")).toBeDefined();
    expect(screen.getByText("Usuários")).toBeDefined();
    expect(screen.getByText("Resultados da Organização")).toBeDefined();
    expect(screen.getByText("Juliana Gestora")).toBeDefined();
    expect(screen.getByText("Gestor")).toBeDefined();
  });

  it("NÃO deve exibir 'Painel administrativo' para Usuário Comum", () => {
    const commonUser: AuthenticatedUser = {
      id: 3,
      name: "Pedro Colaborador",
      email: "pedro@empresa.com",
      role: "common_user",
      permissions: PERMISSIONS_BY_PROFILE.user,
      profile: {
        id: "user",
        name: "Usuário",
        label: "Usuário",
        role: "common_user",
        user_type_id: 3,
        profile_type_id: 3,
        profile_type_name: "Usuário",
        permissions: PERMISSIONS_BY_PROFILE.user,
      },
      active_status: 1,
    };

    useAuthStore.getState().setAuth(commonUser);

    render(<AuthenticatedUserSidebar />);

    expect(screen.getByText("Painel")).toBeDefined();
    expect(screen.getByText("Jornadas")).toBeDefined();
    expect(screen.getByText("Resultados")).toBeDefined();
    expect(screen.queryByText("Painel administrativo")).toBeNull();
    expect(screen.queryByText("Usuários")).toBeNull();
    expect(screen.getByText("Pedro Colaborador")).toBeDefined();
    expect(screen.getByText("Usuário")).toBeDefined();
  });

  it("deve apontar Jornadas para /jornadas e Resultados para /resultados, marcando item ativo só nas rotas válidas", () => {
    const commonUser: AuthenticatedUser = {
      id: 3,
      name: "Pedro Colaborador",
      email: "pedro@empresa.com",
      role: "common_user",
      permissions: PERMISSIONS_BY_PROFILE.user,
      profile: {
        id: "user",
        name: "Usuário",
        label: "Usuário",
        role: "common_user",
        user_type_id: 3,
        profile_type_id: 3,
        profile_type_name: "Usuário",
        permissions: PERMISSIONS_BY_PROFILE.user,
      },
      active_status: 1,
    };

    useAuthStore.getState().setAuth(commonUser);

    mockPathname = "/resultados";
    const { rerender } = render(<AuthenticatedUserSidebar />);

    const journeysLink = screen.getByText("Jornadas").closest("a");
    const resultsLink = screen.getByText("Resultados").closest("a");
    expect(journeysLink?.getAttribute("href")).toBe("/jornadas");
    expect(resultsLink?.getAttribute("href")).toBe("/resultados");
    expect(resultsLink?.getAttribute("aria-current")).toBe("page");
    expect(journeysLink?.getAttribute("aria-current")).toBeNull();

    // Rotas legadas não devem marcar o item como ativo na barra lateral
    mockPathname = "/results";
    rerender(<AuthenticatedUserSidebar />);
    expect(screen.getByText("Resultados").closest("a")?.getAttribute("aria-current")).toBeNull();

    mockPathname = "/assessments";
    rerender(<AuthenticatedUserSidebar />);
    expect(screen.getByText("Jornadas").closest("a")?.getAttribute("aria-current")).toBeNull();

    mockPathname = "/avaliacoes";
    rerender(<AuthenticatedUserSidebar />);
    expect(screen.getByText("Jornadas").closest("a")?.getAttribute("aria-current")).toBeNull();

    mockPathname = "/jornadas";
    rerender(<AuthenticatedUserSidebar />);
    expect(screen.getByText("Jornadas").closest("a")?.getAttribute("aria-current")).toBe("page");
  });
});
