import { apiRequest } from "@services/httpClient";
import type {
  AuthenticatedUser,
  LoginCredentials,
} from "@features/auth/auth.types";

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
  return apiRequest<AuthenticatedUser>(
    "/me",
    {},
    "Não foi possível recuperar o usuário autenticado."
  );
}
