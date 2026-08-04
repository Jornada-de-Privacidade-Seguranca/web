import { PropsWithChildren } from "react";

export interface WithPermissionProps extends PropsWithChildren {
  permission: string | string[];

  /**
   * Behaviour for multiple permissions checking. When 'all' is set, user need to have every required permission. If set to 'any', user need only one.
   *
   * @default 'all'
   */
  needPermissionMode?: "all" | "any";
}

export const WithPermission = ({
  permission,
  children,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  needPermissionMode = "all",
}: WithPermissionProps) => {
  let havePermissions = false;

  // TODO: implementar verificação de permissões no codigo, a depender de como for feita a autenticação e fetch de perfil/permissoes.
  if (Array.isArray(permission)) {
    // TODO: implementar logica para verificação de multiplas permissoes
    havePermissions = true;
  } else {
    // TODO: implementar logica para verificar permissao unica
    havePermissions = true;
  }

  if (!havePermissions) {
    return null;
  }

  return children;
};
