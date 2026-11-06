"use client";

import { useMemo } from "react";
import { useAuth } from "@/hooks/useAuth";
import { PERMISSIONS_BY_PROFILE } from "@/services/authService";
import type { PermissionCode } from "@/features/auth/auth.types";

/**
 * Tabela de permissões e regras do sistema (#132, PR 64 do backend):
 *
 * | Código                 | Ação / Acesso no Sistema                                        | Perfis com Acesso             |
 * |------------------------|-----------------------------------------------------------------|-------------------------------|
 * | `journeys.take`        | Iniciar, responder e concluir questionários de jornadas         | Administrador, Gestor, Usuário|
 * | `journeys.assign`      | Atribuir jornadas a colaboradores e equipes                     | Administrador, Gestor         |
 * | `results.view_own`     | Ver a tela de resultados próprios (/resultados)                 | Administrador, Gestor, Usuário|
 * | `results.view_all`     | Visualizar relatórios e resultados de todos os usuários        | Administrador, Gestor         |
 * | `users.view`           | Visualizar listagem e detalhes de usuários (/admin/usuarios)     | Administrador, Gestor         |
 * | `users.register`       | Cadastrar novos usuários no sistema                             | Administrador                 |
 * | `users.deactivate`     | Ativar e desativar contas de usuários                           | Administrador                 |
 * | `users.manage`         | Gerenciar usuários (editar dados e exclusão permanente)         | Administrador                 |
 * | `users.change_profile` | Alterar o perfil de acesso (Role/Profile) de outros usuários   | Administrador                 |
 * | `catalog.manage`       | Gerenciar catálogo de jornadas e competências                   | Administrador                 |
 */

export interface UsePermissionReturn {
  /**
   * Verifica se o usuário autenticado possui a permissão informada.
   * Se for passado um array de permissões, retorna `true` se o usuário possuir
   * **ao menos uma** delas (comportamento "OR" / "ANY").
   *
   * @example
   * const { can } = usePermission();
   * if (can('users.manage')) { ... }
   * if (can(['users.view', 'results.view_all'])) { ... }
   */
  can: (permission: PermissionCode | PermissionCode[]) => boolean;

  /**
   * Verifica se o usuário autenticado possui **todas** as permissões informadas
   * na lista (comportamento "AND" / "ALL").
   *
   * @example
   * const { canAll } = usePermission();
   * if (canAll(['users.view', 'users.manage'])) { ... }
   */
  canAll: (permissions: PermissionCode[]) => boolean;

  /** Lista completa de códigos de permissões ativas do usuário logado. */
  permissions: PermissionCode[];

  /** Nome amigável do perfil de acesso do usuário (ex: "Administrador", "Gestor"). */
  userProfileName: string;

  /** Se o usuário está autenticado. */
  isAuthenticated: boolean;

  /** Se a sessão ainda está carregando. */
  isLoading: boolean;
}

/**
 * Hook global para controle e checagem de permissões do usuário autenticado.
 * Nenhuma tela ou componente deve verificar nomes ou strings de roles diretamente.
 */
export function usePermission(): UsePermissionReturn {
  const { user, isAuthenticated, isLoading } = useAuth();

  const permissions = useMemo<PermissionCode[]>(() => {
    if (!user) return [];
    // Prioriza user.permissions, fallback para user.profile.permissions
    const list = user.permissions ?? user.profile?.permissions;
    if (Array.isArray(list)) {
      return list;
    }
    // Fallback gracioso para sessões ou mocks legados sem o campo permissions explícito.
    // Trata o Gestor como usuário comum enquanto o /me não traz as permissões (este fallback sai depois da #133).
    if (user.role === "administrator") {
      return PERMISSIONS_BY_PROFILE.administrator ?? [];
    }
    if (user.role === "common_user") {
      return PERMISSIONS_BY_PROFILE.user ?? [];
    }
    return [];
  }, [user]);

  const can = useMemo(() => {
    return (permission: PermissionCode | PermissionCode[]): boolean => {
      if (!isAuthenticated || permissions.length === 0) {
        return false;
      }
      if (Array.isArray(permission)) {
        if (permission.length === 0) return true;
        return permission.some((code) => permissions.includes(code));
      }
      return permissions.includes(permission);
    };
  }, [isAuthenticated, permissions]);

  const canAll = useMemo(() => {
    return (requiredPermissions: PermissionCode[]): boolean => {
      if (!isAuthenticated || permissions.length === 0) {
        return requiredPermissions.length === 0;
      }
      return requiredPermissions.every((code) => permissions.includes(code));
    };
  }, [isAuthenticated, permissions]);

  const userProfileName = useMemo(() => {
    if (!user) return "";
    return (
      user.profile?.name ||
      user.profile?.label ||
      user.profile?.profile_type_name ||
      ""
    );
  }, [user]);

  return {
    can,
    canAll,
    permissions,
    userProfileName,
    isAuthenticated,
    isLoading,
  };
}
