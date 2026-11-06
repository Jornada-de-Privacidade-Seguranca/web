import { ApiRequestError, apiRequest } from "@services/httpClient";
import type {
  AuthenticatedUser,
  LoginCredentials,
  PermissionCode,
} from "@features/auth/auth.types";

export const PERMISSIONS_BY_PROFILE: Record<string, PermissionCode[]> = {
  administrator: [
    "journeys.take",
    "journeys.assign",
    "results.view_own",
    "results.view_all",
    "users.view",
    "users.register",
    "users.deactivate",
    "users.manage",
    "users.change_profile",
    "catalog.manage",
  ],
  manager: [
    "users.view",
    "results.view_all",
    "journeys.assign",
    "journeys.take",
    "results.view_own",
  ],
  user: ["journeys.take", "results.view_own"],
};

export const MOCK_DEV_USER: AuthenticatedUser = {
  id: 1,
  name: "Usuário Teste",
  email: "usuario@teste.com",
  role: "common_user",
  permissions: PERMISSIONS_BY_PROFILE.user,
  profile: {
    id: "user",
    name: "Usuário",
    role: "common_user",
    label: "Colaborador",
    user_type_id: 1,
    profile_type_id: 1,
    profile_type_name: "Colaborador",
    permissions: PERMISSIONS_BY_PROFILE.user,
  },
  active_status: 1,
};

export async function login(
  credentials: LoginCredentials
): Promise<AuthenticatedUser> {
  return apiRequest<AuthenticatedUser>(
    "/auth/login",
    { method: "post", data: credentials, withCsrf: true },
    "Usuário e/ou senha inválidos."
  );
}

export async function logout(): Promise<void> {
  await apiRequest<null>(
    "/auth/logout",
    { method: "post", withCsrf: true },
    "Não foi possível encerrar a sessão."
  );
}

export async function getAuthenticatedUser(): Promise<AuthenticatedUser> {
  try {
    return await apiRequest<AuthenticatedUser>(
      "/me",
      {},
      "Não foi possível recuperar o usuário autenticado."
    );
  } catch (err: unknown) {
    // Só sem resposta do backend (erro de rede): um 401 segue como sessão
    // inexistente, para que a expiração possa ser testada localmente.
    const isNetworkError = err instanceof ApiRequestError && err.status === undefined;
    if (process.env.NODE_ENV === "development" && isNetworkError) {
      return MOCK_DEV_USER;
    }
    throw err;
  }
}

/**
 * Renova a sessão a pedido do usuário, no aviso de expiração. Diferente de
 * `getAuthenticatedUser`, nunca usa o usuário de teste: sem resposta do backend,
 * a sessão não foi renovada e o aviso precisa continuar aberto.
 */
export async function renewSession(): Promise<void> {
  await apiRequest<AuthenticatedUser>(
    "/me",
    {},
    "Não foi possível renovar a sessão."
  );
}
