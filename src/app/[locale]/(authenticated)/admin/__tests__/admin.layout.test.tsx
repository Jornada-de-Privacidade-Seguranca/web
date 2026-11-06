// @vitest-environment jsdom

import { render, screen } from "@testing-library/react";
import { describe, it, expect, beforeEach, vi } from "vitest";
import AdminLayout from "../layout";
import { useAuthStore } from "@/features/auth/auth.store";
import type { AuthenticatedUser } from "@/features/auth/auth.types";

const mockReplace = vi.fn();

vi.mock("@/shared/i18n/navigation", () => ({
  useRouter: () => ({
    replace: mockReplace,
    push: vi.fn(),
  }),
}));

describe("AdminLayout Component (Route Guard)", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    mockReplace.mockClear();
    useAuthStore.getState().clearAuth();
  });

  it("deve bloquear acesso e redirecionar para /painel?error=access_denied quando usuário não tiver permissão", () => {
    const commonUser: AuthenticatedUser = {
      id: 3,
      name: "Usuário Sem Permissão",
      email: "sem@empresa.com",
      role: "common_user",
      permissions: ["journeys.take", "results.view_own"],
      profile: {
        id: "user",
        name: "Usuário",
        label: "Usuário",
        role: "common_user",
        user_type_id: 3,
        profile_type_id: 3,
        profile_type_name: "Usuário",
        permissions: ["journeys.take", "results.view_own"],
      },
      active_status: 1,
    };

    useAuthStore.getState().setAuth(commonUser);

    render(
      <AdminLayout>
        <div data-testid="admin-content">Conteúdo Restrito</div>
      </AdminLayout>
    );

    expect(screen.queryByTestId("admin-content")).toBeNull();
    expect(mockReplace).toHaveBeenCalledWith("/painel?error=access_denied");
  });

  it("deve renderizar o conteúdo administrativo quando o usuário tiver a permissão users.view", () => {
    const adminUser: AuthenticatedUser = {
      id: 1,
      name: "Admin",
      email: "admin@empresa.com",
      role: "administrator",
      permissions: ["users.view", "users.manage"],
      profile: {
        id: "admin",
        name: "Administrador",
        label: "Administrador",
        role: "administrator",
        user_type_id: 1,
        profile_type_id: 1,
        profile_type_name: "Administrador",
        permissions: ["users.view", "users.manage"],
      },
      active_status: 1,
    };

    useAuthStore.getState().setAuth(adminUser);

    render(
      <AdminLayout>
        <div data-testid="admin-content">Conteúdo Restrito</div>
      </AdminLayout>
    );

    expect(screen.getByTestId("admin-content")).toBeDefined();
    expect(mockReplace).not.toHaveBeenCalled();
  });
});

