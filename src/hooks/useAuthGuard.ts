"use client";

import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { usePermission } from "@/hooks/usePermission";
import { usePathname, useRouter } from "@/shared/i18n/navigation";
import {
  DEFAULT_AUTHENTICATED_PATH,
  LOGIN_PATH,
  buildSessionExpiredLoginPath,
  readCurrentLoginRedirectPath,
} from "@/shared/utils/loginRedirect";
import { clearSessionMarker } from "@/shared/utils/sessionMarker";
import type { PermissionCode } from "@/features/auth/auth.types";

/**
 * Redireciona para /login quando não houver sessão autenticada. Se a sessão
 * expirou, não redireciona sozinho: o layout mostra o aviso, e `goToLogin`
 * encerra a sessão local e leva ao login guardando a página atual, para voltar
 * a ela depois de entrar.
 */
export function useRequireAuth() {
  const { user, isAuthenticated, isLoading, sessionExpired, expireSession } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading && !isAuthenticated && !sessionExpired) {
      router.replace(LOGIN_PATH);
    }
  }, [isLoading, isAuthenticated, sessionExpired, router]);

  function goToLogin() {
    // Mantém sessionExpired: limpar tudo faria o efeito acima redirecionar ao
    // login sem a página de retorno
    expireSession();
    // A expiração já foi avisada; o aviso no login vem do `reason` da URL, e
    // voltar depois sem entrar leva direto ao login, sem repetir o modal
    clearSessionMarker();
    router.replace(buildSessionExpiredLoginPath(`${pathname}${window.location.search}`));
  }

  return { user, isAuthenticated, isLoading, sessionExpired, goToLogin };
}

/**
 * Redireciona quem já está autenticado: para a página de retorno informada no
 * login (só caminhos internos) ou, sem ela, para /painel.
 */
export function useRequireGuest() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace(readCurrentLoginRedirectPath() ?? DEFAULT_AUTHENTICATED_PATH);
    }
  }, [isLoading, isAuthenticated, router]);

  return { isAuthenticated, isLoading };
}

export interface RequirePermissionOptions {
  /**
   * Modo de verificação para múltiplas permissões:
   * - 'any': Requer ao menos uma das permissões.
   * - 'all': Requer todas as permissões.
   *
   * @default 'any'
   */
  mode?: "any" | "all";
  /**
   * Rota de redirecionamento caso o usuário não tenha permissão.
   * @default '/painel?error=access_denied'
   */
  redirectTo?: string;
}

/**
 * Guarda de permissão para rotas protegidas.
 * Se o usuário não possuir as permissões necessárias, bloqueia o acesso e redireciona.
 */
export function useRequirePermission(
  requiredPermissions: PermissionCode | PermissionCode[],
  options?: RequirePermissionOptions
) {
  const { can, canAll, isAuthenticated, isLoading } = usePermission();
  const router = useRouter();

  const mode = options?.mode ?? "any";
  const redirectTo = options?.redirectTo ?? "/painel?error=access_denied";

  const hasAccess = Array.isArray(requiredPermissions)
    ? mode === "all"
      ? canAll(requiredPermissions)
      : can(requiredPermissions)
    : can(requiredPermissions);

  useEffect(() => {
    if (!isLoading && isAuthenticated && !hasAccess) {
      router.replace(redirectTo);
    }
  }, [isLoading, isAuthenticated, hasAccess, router, redirectTo]);

  return { hasAccess, isLoading, isAuthenticated };
}
