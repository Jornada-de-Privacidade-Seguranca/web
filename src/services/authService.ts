import { apiRequest } from "@services/httpClient";
import type {
  AuthenticatedUser,
  LoginCredentials,
} from "@features/auth/auth.types";

const MOCK_DEV_USER: AuthenticatedUser = {
  id: 1,
  name: "Usuário Teste",
  email: "usuario@teste.com",
  role: "common_user",
  profile: {
    role: "common_user",
    label: "Colaborador",
    user_type_id: 1,
    profile_type_id: 1,
    profile_type_name: "Colaborador",
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
    if (process.env.NODE_ENV === "development") {
      return MOCK_DEV_USER;
    }
    throw err;
  }
}
