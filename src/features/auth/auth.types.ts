import type { UseFormReturn } from "react-hook-form";
import type { ReactNode } from "react";

export interface LoginFormValues {
  email: string;
  password: string;
}

export interface AuthValidationMessages {
  emailRequired: string;
  emailInvalid: string;
  passwordRequired: string;
}

export interface AuthLabels {
  title: string;
  description: string;
  welcomeTitle: string;
  welcomeDescription: string;
  emailLabel: string;
  emailPlaceholder: string;
  passwordLabel: string;
  passwordPlaceholder: string;
  forgotPassword: string;
  submit: string;
  signUpPrefix: string;
  signUpLink: string;
  privacyNotice: string;
}

export interface AuthServerMessage {
  title: string;
  description?: string;
  icon?: ReactNode;
  variant?: "default" | "info" | "success" | "warning" | "destructive";
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export type AuthenticatedUserRole = "common_user" | "administrator";

/**
 * Códigos padronizados de permissões do sistema (#132, PR 64 do backend).
 * - journeys.take: Iniciar, responder e concluir jornadas.
 * - journeys.assign: Atribuir jornadas para usuários.
 * - results.view_own: Ver os próprios resultados de jornadas.
 * - results.view_all: Ver resultados e relatórios de todos os usuários.
 * - users.view: Ver a listagem e os dados de usuários.
 * - users.register: Cadastrar novos usuários no sistema.
 * - users.deactivate: Ativar e desativar contas de usuários.
 * - users.manage: Gerenciar usuários (edição, exclusão e administração geral).
 * - users.change_profile: Alterar o perfil de acesso de usuários.
 * - catalog.manage: Gerenciar catálogo de jornadas e competências.
 */
export type PermissionCode =
  | "journeys.take"
  | "journeys.assign"
  | "results.view_own"
  | "results.view_all"
  | "users.view"
  | "users.register"
  | "users.deactivate"
  | "users.manage"
  | "users.change_profile"
  | "catalog.manage"
  | (string & {});

export interface AuthenticatedUserProfile {
  id?: number | string;
  name?: string;
  role: AuthenticatedUserRole;
  label: string;
  user_type_id: number | null;
  profile_type_id: number | null;
  profile_type_name: string | null;
  permissions?: PermissionCode[];
}

/** Formato do usuário autenticado retornado por /auth/login, /auth/register e /me. */
export interface AuthenticatedUser {
  id: number;
  name: string;
  email: string;
  role: AuthenticatedUserRole;
  profile: AuthenticatedUserProfile;
  permissions?: PermissionCode[];
  active_status: number;
  organization?: string;
}

export interface AuthViewModelReturn {
  form: UseFormReturn<LoginFormValues>;
  serverMessage: AuthServerMessage | null;
  onCloseMsg: () => void;
  handleSubmit: () => void;
  labels: AuthLabels;
  user?: AuthenticatedUser | null;
}
