import { ApiRequestError, apiRequest } from "@services/httpClient";
import type {
  AuthenticatedUser,
  LoginCredentials,
  PermissionCode,
} from "@features/auth/auth.types";

export const PERMISSIONS_BY_PROFILE: Record<string, PermissionCode[]> = {
  administrator: [
    "journeys.take",
    "results.view_own",
    "users.view",
    "users.manage",
    "users.manage_roles",
    "users.delete",
    "results.view_all",
    "journeys.assign",
    "system.configure",
  ],
  manager: [
    "journeys.take",
    "results.view_own",
    "users.view",
    "results.view_all",
    "journeys.assign",
  ],
  user: ["journeys.take", "results.view_own"],
  registration: ["users.view", "users.manage"],
};

export const MOCK_DEV_USER: AuthenticatedUser = {
  id: 1,
  name: "Administrador do Sistema",
  email: "admin@teste.com",
  role: "administrator",
  permissions: PERMISSIONS_BY_PROFILE.administrator,
  profile: {
    id: "admin",
    name: "Administrador",
    role: "administrator",
    label: "Administrador",
    user_type_id: 1,
    profile_type_id: 1,
    profile_type_name: "Administrador",
    permissions: PERMISSIONS_BY_PROFILE.administrator,
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
