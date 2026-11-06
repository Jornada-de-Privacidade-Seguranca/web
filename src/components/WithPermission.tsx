"use client";

import type { PropsWithChildren, ReactNode } from "react";
import { usePermission } from "@/hooks/usePermission";
import type { PermissionCode } from "@/features/auth/auth.types";

export interface WithPermissionProps extends PropsWithChildren {
  /** Código de permissão único ou lista de códigos. */
  permission: PermissionCode | PermissionCode[];

  /**
   * Comportamento na verificação de múltiplas permissões:
   * - 'all': O usuário precisa ter TODAS as permissões da lista.
   * - 'any': O usuário precisa ter AO MENOS UMA das permissões da lista.
   *
   * @default 'all'
   */
  needPermissionMode?: "all" | "any";

  /** Conteúdo opcional a ser exibido caso o usuário NÃO tenha permissão (ex: mensagem ou botão desabilitado). */
  fallback?: ReactNode;
}

export const WithPermission = ({
  permission,
  children,
  needPermissionMode = "all",
  fallback = null,
}: WithPermissionProps) => {
  const { can, canAll } = usePermission();

  const hasAccess = Array.isArray(permission)
    ? needPermissionMode === "all"
      ? canAll(permission)
      : can(permission)
    : can(permission);

  if (!hasAccess) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};
