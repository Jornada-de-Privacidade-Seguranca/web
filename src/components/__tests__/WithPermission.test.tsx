// @vitest-environment jsdom

import { render, screen } from "@testing-library/react";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { WithPermission } from "../WithPermission";
import { useAuthStore } from "@/features/auth/auth.store";
import type { AuthenticatedUser } from "@/features/auth/auth.types";

describe("WithPermission Component", () => {
  const mockUser: AuthenticatedUser = {
    id: 1,
    name: "Gestor",
    email: "gestor@empresa.com",
    role: "administrator",
    permissions: ["journeys.take", "users.view", "results.view_all"],
    profile: {
      id: "manager",
      name: "Gestor",
      label: "Gestor",
      role: "administrator",
      user_type_id: 2,
      profile_type_id: 2,
      profile_type_name: "Gestor",
      permissions: ["journeys.take", "users.view", "results.view_all"],
    },
    active_status: 1,
  };

  beforeEach(() => {
    vi.restoreAllMocks();
    useAuthStore.getState().setAuth(mockUser);
  });

  it("deve renderizar o conteúdo filho quando o usuário possui a permissão requerida", () => {
    render(
      <WithPermission permission="users.view">
        <button type="button">Gerenciar Usuários</button>
      </WithPermission>
    );

    expect(
      screen.getByRole("button", { name: /Gerenciar Usuários/i })
    ).toBeDefined();
  });

  it("NÃO deve renderizar o conteúdo quando o usuário NÃO possui a permissão", () => {
    render(
      <WithPermission permission="users.change_profile">
        <button type="button">Excluir Conta</button>
      </WithPermission>
    );

    expect(
      screen.queryByRole("button", { name: /Excluir Conta/i })
    ).toBeNull();
  });

  it("deve renderizar o fallback quando o usuário não tiver permissão", () => {
    render(
      <WithPermission
        permission="users.change_profile"
        fallback={<span data-testid="fallback-msg">Sem permissão</span>}
      >
        <button type="button">Excluir Conta</button>
      </WithPermission>
    );

    expect(screen.getByTestId("fallback-msg")).toBeDefined();
    expect(
      screen.queryByRole("button", { name: /Excluir Conta/i })
    ).toBeNull();
  });

  it("deve suportar modo 'any' para múltiplas permissões", () => {
    render(
      <WithPermission
        permission={["users.change_profile", "users.view"]}
        needPermissionMode="any"
      >
        <div data-testid="allowed-content">Acesso Concedido</div>
      </WithPermission>
    );

    expect(screen.getByTestId("allowed-content")).toBeDefined();
  });

  it("deve bloquear no modo 'all' quando faltar alguma permissão", () => {
    render(
      <WithPermission
        permission={["users.view", "users.change_profile"]}
        needPermissionMode="all"
      >
        <div data-testid="blocked-content">Bloqueado</div>
      </WithPermission>
    );

    expect(screen.queryByTestId("blocked-content")).toBeNull();
  });
});
