import type { UseFormReturn } from "react-hook-form";
import type { ReactNode } from "react";

export interface CadastroFormValues {
  nomeCompleto: string;
  codigoFuncionario: string;
  departamento: string;
  empresa: string;
  email: string;
  senha: string;
  confirmarSenha: string;
  aceitouTermos: boolean;
}

/** Dados do formulário enviados ao cadastro; o aceite dos termos não vai para a API. */
export type CadastroFormData = Omit<CadastroFormValues, "aceitouTermos">;

/** Corpo de POST /auth/register. O perfil de acesso é definido pelo backend. */
export interface CadastroPayload {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
  organization: string;
  department: string;
  registration_number: string;
}

/** `data` da resposta 201 de POST /auth/register. */
export interface CadastroResponse {
  id: number;
  name: string;
  email: string;
  organization_company: string;
  department: string;
  registration_number: string;
  profile_type_id: number;
  journey_profile_id: number | null;
  active_status: number;
  account_status: "pending_activation";
  created_at: string | null;
}

export type CadastroRequestErrorType = "validation" | "already_registered" | "server_error";

/** Mensagens de erro da API, já com os nomes dos campos do formulário. */
export type CadastroFieldErrors = Partial<Record<keyof CadastroFormData, string>>;

export interface CadastroFieldErrorsSplit {
  fieldErrors: CadastroFieldErrors;
  /** Mensagens de campos da API que não existem no formulário */
  otherErrors: string[];
}

export interface CadastroValidationMessages {
  fullNameRequired: string;
  fullNameLastName: string;
  fullNameMaxLength: string;
  employeeCodeRequired: string;
  employeeCodeMaxLength: string;
  departmentRequired: string;
  departmentMaxLength: string;
  companyRequired: string;
  companyMaxLength: string;
  emailRequired: string;
  emailInvalid: string;
  emailMaxLength: string;
  passwordRequired: string;
  passwordMinLength: string;
  passwordMaxLength: string;
  confirmPasswordRequired: string;
  passwordsDoNotMatch: string;
  termsRequired: string;
}

export interface CadastroLabels {
  title: string;
  description: string;
  cardTitle: string;
  cardSubtitle: string;
  fullNameLabel: string;
  fullNamePlaceholder: string;
  employeeCodeLabel: string;
  employeeCodePlaceholder: string;
  departmentLabel: string;
  departmentPlaceholder: string;
  companyLabel: string;
  companyPlaceholder: string;
  emailLabel: string;
  emailPlaceholder: string;
  passwordLabel: string;
  passwordPlaceholder: string;
  confirmPasswordLabel: string;
  confirmPasswordPlaceholder: string;
  termsCheckbox: string;
  submit: string;
  hasAccountText: string;
  loginLink: string;
}

export interface CadastroServerErrorLabels {
  invalidFieldsTitle: string;
  alreadyRegisteredTitle: string;
  alreadyRegisteredDescription: string;
  serverErrorTitle: string;
  serverErrorDescription: string;
}

export interface CadastroServerMessage {
  title: string;
  description?: string;
  icon?: ReactNode;
  variant?: "default" | "info" | "success" | "warning" | "destructive";
}

export interface CadastroViewModelReturn {
  form: UseFormReturn<CadastroFormValues>;
  serverMessage: CadastroServerMessage | null;
  onCloseMsg: () => void;
  handleSubmit: (e?: React.BaseSyntheticEvent) => Promise<void>;
  labels: CadastroLabels;
  isSuccess: boolean;
}
