import type { UseFormReturn } from "react-hook-form";

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

export interface AuthViewModelReturn {
  form: UseFormReturn<LoginFormValues>;
  handleSubmit: () => void;
  labels: AuthLabels;
}