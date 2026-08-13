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

export interface AuthenticatedUserProfile {
  role: AuthenticatedUserRole;
  label: string;
  user_type_id: number | null;
  profile_type_id: number | null;
  profile_type_name: string | null;
}

/** Formato do usuário autenticado retornado por /auth/login, /auth/register e /me. */
export interface AuthenticatedUser {
  id: number;
  name: string;
  email: string;
  role: AuthenticatedUserRole;
  profile: AuthenticatedUserProfile;
  active_status: number;
}

export interface AuthViewModelReturn {
  form: UseFormReturn<LoginFormValues>;
  serverMessage: AuthServerMessage | null;
  onCloseMsg: () => void;
  handleSubmit: () => void;
  labels: AuthLabels;
  user?: AuthenticatedUser | null;
}
