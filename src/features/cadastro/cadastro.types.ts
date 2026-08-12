import type { UseFormReturn } from "react-hook-form";
import type { ReactNode } from "react";

export interface CadastroFormValues {
  nomeCompleto: string;
  codigoFuncionario: string;
  departamento: string;
  empresa?: string;
  email: string;
  senha: string;
  confirmarSenha: string;
  aceitouTermos: boolean;
}

export interface CadastroPayload {
  nomeCompleto: string;
  codigoFuncionario: string;
  departamento: string;
  empresa?: string;
  email: string;
  senha: string;
}

export interface CadastroResponse {
  id: string;
  nomeCompleto: string;
  email: string;
  codigoFuncionario: string;
  departamento: string;
  empresa?: string;
}

export interface CadastroValidationMessages {
  fullNameRequired: string;
  employeeCodeRequired: string;
  departmentRequired: string;
  companyRequired: string;
  emailRequired: string;
  emailInvalid: string;
  passwordRequired: string;
  passwordMinLength: string;
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
  isGeneralSystem: boolean;
  isSuccess: boolean;
}
