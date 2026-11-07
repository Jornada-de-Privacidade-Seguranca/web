// @vitest-environment jsdom

import { renderHook } from "@testing-library/react";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { usePermission } from "../usePermission";
import { useAuthStore } from "@/features/auth/auth.store";
import { PERMISSIONS_BY_PROFILE } from "@/services/authService";
import type { AuthenticatedUser } from "@/features/auth/auth.types";

describe("usePermission Hook", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    useAuthStore.getState().clearAuth();
  });

  it("deve retornar permissões vazias e can() false quando deslogado", () => {
    const { result } = renderHook(() => usePermission());

    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.permissions).toEqual([]);
    expect(result.current.can("users.view")).toBe(false);
    expect(result.current.can(["users.view", "journeys.take"])).toBe(false);
    expect(result.current.canAll(["users.view"])).toBe(false);
    expect(result.current.userProfileName).toBe("");
  });

  describe("Perfil: Administrador", () => {
    const adminUser: AuthenticatedUser = {
      id: 1,
      name: "Admin Geral",
      email: "admin@empresa.com",
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

    beforeEach(() => {
      useAuthStore.getState().setAuth(adminUser);
    });

    it("deve ter acesso total a todas as permissões administrativas e de usuário da #132", () => {
      const { result } = renderHook(() => usePermission());

      expect(result.current.isAuthenticated).toBe(true);
      expect(result.current.userProfileName).toBe("Administrador");
      expect(result.current.can("journeys.take")).toBe(true);
      expect(result.current.can("journeys.assign")).toBe(true);
      expect(result.current.can("results.view_own")).toBe(true);
      expect(result.current.can("results.view_all")).toBe(true);
      expect(result.current.can("users.view")).toBe(true);
      expect(result.current.can("users.register")).toBe(true);
      expect(result.current.can("users.deactivate")).toBe(true);
      expect(result.current.can("users.manage")).toBe(true);
      expect(result.current.can("users.change_profile")).toBe(true);
      expect(result.current.can("catalog.manage")).toBe(true);
    });

    it("deve validar canAll corretamente para múltiplas permissões", () => {
      const { result } = renderHook(() => usePermission());

      expect(
        result.current.canAll(["users.view", "users.manage", "catalog.manage"])
      ).toBe(true);
    });
  });

  describe("Perfil: Gestor", () => {
    const managerUser: AuthenticatedUser = {
      id: 2,
      name: "Gestor Regional",
      email: "gestor@empresa.com",
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

    beforeEach(() => {
      useAuthStore.getState().setAuth(managerUser);
    });

    it("deve visualizar relatórios e usuários, mas NÃO pode alterar perfis (users.change_profile) nem gerenciar catálogo", () => {
      const { result } = renderHook(() => usePermission());

      expect(result.current.userProfileName).toBe("Gestor");
      // Permitidos na #132:
      expect(result.current.can("journeys.take")).toBe(true);
      expect(result.current.can("results.view_own")).toBe(true);
      expect(result.current.can("users.view")).toBe(true);
      expect(result.current.can("results.view_all")).toBe(true);
      expect(result.current.can("journeys.assign")).toBe(true);

      // Bloqueados para o Gestor:
      expect(result.current.can("users.change_profile")).toBe(false);
      expect(result.current.can("users.manage")).toBe(false);
      expect(result.current.can("users.deactivate")).toBe(false);
      expect(result.current.can("catalog.manage")).toBe(false);
    });

    it("can() com array deve retornar true se ao menos uma for permitida (modo ANY)", () => {
      const { result } = renderHook(() => usePermission());

      // Possui users.view, mas não users.change_profile
      expect(result.current.can(["users.change_profile", "users.view"])).toBe(true);
    });

    it("canAll() com array deve retornar false se alguma não for permitida", () => {
      const { result } = renderHook(() => usePermission());

      expect(result.current.canAll(["users.view", "users.change_profile"])).toBe(false);
    });
  });

  describe("Perfil: Usuário Comum", () => {
    const commonUser: AuthenticatedUser = {
      id: 3,
      name: "João Silva",
      email: "joao@empresa.com",
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

    beforeEach(() => {
      useAuthStore.getState().setAuth(commonUser);
    });

    it("deve acessar apenas jornadas e resultados próprios", () => {
      const { result } = renderHook(() => usePermission());

      expect(result.current.userProfileName).toBe("Usuário");
      expect(result.current.can("journeys.take")).toBe(true);
      expect(result.current.can("results.view_own")).toBe(true);

      expect(result.current.can("users.view")).toBe(false);
      expect(result.current.can("users.manage")).toBe(false);
      expect(result.current.can("users.change_profile")).toBe(false);
      expect(result.current.can("results.view_all")).toBe(false);
    });
  });
});
