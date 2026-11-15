// @vitest-environment jsdom

import { render, screen } from "@testing-library/react";
import { describe, it, expect, beforeEach, vi } from "vitest";
import AdminUsuarioNovoLayout from "../usuarios/novo/layout";
import { useAuthStore } from "@/features/auth/auth.store";
import type { AuthenticatedUser } from "@/features/auth/auth.types";

const mockReplace = vi.fn();

vi.mock("@/shared/i18n/navigation", () => ({
  useRouter: () => ({
    replace: mockReplace,
    push: vi.fn(),
  }),
  usePathname: () => "/admin/usuarios/novo",
}));

describe("AdminUsuarioNovoLayout (Route Guard /admin/usuarios/novo)", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    mockReplace.mockClear();
    useAuthStore.getState().clearAuth();
  });

  it("deve bloquear usuário sem permissão users.register (inclusive Gestor) e redirecionar para acesso negado", () => {
    const managerUser: AuthenticatedUser = {
      id: 2,
      name: "Gestor",
      email: "gestor@empresa.com",
      role: "common_user",
      permissions: ["users.view", "results.view_all", "journeys.assign"],
      profile: {
        id: "manager",
        name: "Gestor",
        label: "Gestor",
        role: "common_user",
        user_type_id: 2,
        profile_type_id: 2,
        profile_type_name: "Gestor",
        permissions: ["users.view", "results.view_all", "journeys.assign"],
      },
      active_status: 1,
    };

    useAuthStore.getState().setAuth(managerUser);

    render(
      <AdminUsuarioNovoLayout>
        <div data-testid="invite-route-content">Formulário de Convite</div>
      </AdminUsuarioNovoLayout>
    );

    expect(screen.queryByTestId("invite-route-content")).toBeNull();
    expect(mockReplace).toHaveBeenCalledWith("/painel?error=access_denied");
  });

  it("deve permitir o acesso quando o usuário possuir a permissão users.register", () => {
    const adminUser: AuthenticatedUser = {
      id: 1,
      name: "Admin",
      email: "admin@empresa.com",
      role: "administrator",
      permissions: ["users.view", "users.register"],
      profile: {
        id: "admin",
        name: "Administrador",
        label: "Administrador",
        role: "administrator",
        user_type_id: 1,
        profile_type_id: 1,
        profile_type_name: "Administrador",
        permissions: ["users.view", "users.register"],
      },
      active_status: 1,
    };

    useAuthStore.getState().setAuth(adminUser);

    render(
      <AdminUsuarioNovoLayout>
        <div data-testid="invite-route-content">Formulário de Convite</div>
      </AdminUsuarioNovoLayout>
    );

    expect(screen.getByTestId("invite-route-content")).toBeDefined();
    expect(mockReplace).not.toHaveBeenCalled();
  });
});
