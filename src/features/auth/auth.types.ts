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
 * Códigos padronizados de permissões do sistema.
 * - journeys.take: Iniciar, responder e concluir jornadas.
 * - results.view_own: Ver os próprios resultados de jornadas.
 * - users.view: Ver a listagem e os dados de usuários.
 * - users.manage: Cadastrar, editar e ativar/desativar usuários.
 * - users.manage_roles: Alterar perfis de acesso de usuários.
 * - users.delete: Excluir usuários.
 * - results.view_all: Ver resultados e relatórios de todos os usuários.
 * - journeys.assign: Atribuir jornadas para usuários.
 * - system.configure: Configurações globais do sistema.
 */
export type PermissionCode =
  | "journeys.take"
  | "results.view_own"
  | "users.view"
  | "users.manage"
  | "users.manage_roles"
  | "users.delete"
  | "results.view_all"
  | "journeys.assign"
  | "system.configure"
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
