// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { describe, it, expect, beforeEach, vi } from "vitest";
import AdminResultadosLayout from "../layout";
import { useAuthStore } from "@/features/auth/auth.store";
import type { AuthenticatedUser } from "@/features/auth/auth.types";

const mockReplace = vi.fn();

vi.mock("@/shared/i18n/navigation", () => ({
  useRouter: () => ({
    replace: mockReplace,
    push: vi.fn(),
  }),
}));

describe("AdminResultadosLayout (Route Guard)", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    mockReplace.mockClear();
    useAuthStore.getState().clearAuth();
  });

  it("deve bloquear usuário sem permissão results.view_all mesmo que tenha users.view", () => {
    const userWithoutViewAll: AuthenticatedUser = {
      id: 2,
      name: "Gestor de Usuários",
      email: "usuarios@empresa.com",
      role: "common_user",
      permissions: ["users.view", "journeys.take"],
      profile: {
        id: "custom",
        name: "Custom",
        label: "Custom",
        role: "common_user",
        user_type_id: 2,
        profile_type_id: 2,
        profile_type_name: "Custom",
        permissions: ["users.view", "journeys.take"],
      },
      active_status: 1,
    };

    useAuthStore.getState().setAuth(userWithoutViewAll);

    render(
      <AdminResultadosLayout>
        <div data-testid="admin-results-content">Resultados Admin</div>
      </AdminResultadosLayout>
    );

    expect(screen.queryByTestId("admin-results-content")).toBeNull();
    expect(mockReplace).toHaveBeenCalledWith("/painel?error=access_denied");
  });

  it("deve permitir acesso quando o usuário possuir a permissão results.view_all", () => {
    const authorizedUser: AuthenticatedUser = {
      id: 1,
      name: "Gestor",
      email: "gestor@empresa.com",
      role: "administrator",
      permissions: ["results.view_all"],
      profile: {
        id: "manager",
        name: "Gestor",
        label: "Gestor",
        role: "administrator",
        user_type_id: 2,
        profile_type_id: 2,
        profile_type_name: "Gestor",
        permissions: ["results.view_all"],
      },
      active_status: 1,
    };

    useAuthStore.getState().setAuth(authorizedUser);

    render(
      <AdminResultadosLayout>
        <div data-testid="admin-results-content">Resultados Admin</div>
      </AdminResultadosLayout>
    );

    expect(screen.getByTestId("admin-results-content")).toBeDefined();
    expect(mockReplace).not.toHaveBeenCalled();
  });
});
