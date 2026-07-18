import type { UseFormReturn } from "react-hook-form";
import type { ReactNode } from "react";

export interface LoginFormValues {
  username: string;
  password: string;
}

export interface AuthValidationMessages {
  usernameRequired: string;
  passwordRequired: string;
}

export interface AuthLabels {
  title: string;
  description: string;
  welcomeTitle: string;
  welcomeDescription: string;
  usernameLabel: string;
  usernamePlaceholder: string;
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

export interface AuthViewModelReturn {
  form: UseFormReturn<LoginFormValues>;
  serverMessage: AuthServerMessage | null;
  onCloseMsg: () => void;
  handleSubmit: () => void;
  labels: AuthLabels;
}