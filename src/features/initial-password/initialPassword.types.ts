import type { UseFormReturn } from "react-hook-form";

import type { CadastroFieldErrors, CadastroFormData } from "@features/cadastro/cadastro.types";

/** Dados pessoais e senha preenchidos pela pessoa convidada; o e-mail vem do link. */
export type InitialPasswordFormValues = Omit<CadastroFormData, "email">;

/** E-mail e código do convite, lidos do link do e-mail. */
export interface InvitationCredentials {
  email: string;
  token: string;
}

/** `data` da resposta 200 de POST /auth/invitations/validate. */
export interface ValidateInvitationResponse {
  email: string;
  is_valid: true;
}

/** Corpo de POST /auth/invitations/complete, com os dados pessoais combinados na #122. */
export interface CompleteInvitationPayload {
  email: string;
  token: string;
  name: string;
  organization: string;
  department: string;
  registration_number: string;
  password: string;
  password_confirmation: string;
}

/** `data` da resposta 200 de POST /auth/invitations/complete (InvitedUserResource). */
export interface InvitedUserResponse {
  id: number;
  email: string;
  user_type_id: number | null;
  active_status: number;
  account_status: "active" | "pending_initial_password";
}

/**
 * - `invalid_invitation`: convite inválido, expirado ou já usado (422 com
 *   INVALID_INVITATION_TOKEN) ou link com e-mail e código malformados;
 * - `validation`: 422 com as mensagens por campo;
 * - `server_error`: demais falhas.
 */
export type InvitationRequestErrorType = "invalid_invitation" | "validation" | "server_error";

/** Mensagens de erro da API, já com os nomes dos campos do formulário. */
export type InitialPasswordFieldErrors = Pick<CadastroFieldErrors, keyof InitialPasswordFormValues>;

/** Etapa da página: validando o link, link inválido ou formulário. */
export type InitialPasswordStatus = "validating" | "invalid" | "validation_failed" | "ready";

export interface InitialPasswordServerMessage {
  title: string;
  description?: string;
  variant: "destructive";
}

export interface InitialPasswordLabels {
  appName: string;
  tagline: string;
  title: string;
  subtitle: string;
  validating: string;
  invalidInvitation: string;
  backToLogin: string;
  validationFailed: string;
  retry: string;
  emailLabel: string;
  fullNameLabel: string;
  fullNamePlaceholder: string;
  companyLabel: string;
  companyPlaceholder: string;
  departmentLabel: string;
  departmentPlaceholder: string;
  employeeCodeLabel: string;
  employeeCodePlaceholder: string;
  passwordLabel: string;
  passwordPlaceholder: string;
  confirmPasswordLabel: string;
  confirmPasswordPlaceholder: string;
  submit: string;
  submitting: string;
}

export interface InitialPasswordViewModelReturn {
  status: InitialPasswordStatus;
  email: string;
  form: UseFormReturn<InitialPasswordFormValues>;
  isSubmitting: boolean;
  serverMessage: InitialPasswordServerMessage | null;
  onCloseMsg: () => void;
  handleSubmit: (e?: React.BaseSyntheticEvent) => Promise<void>;
  handleRetry: () => void;
  labels: InitialPasswordLabels;
}
