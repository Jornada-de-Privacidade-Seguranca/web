import { useTranslations } from "next-intl";
import { z } from "zod";

import type { CadastroValidationMessages } from "./cadastro.types";

/** Nome e sobrenome, a mesma regra do POST /auth/register. */
const FULL_NAME_PATTERN = /^\S+\s+\S+/u;

/** Mensagens de validação do cadastro, também usadas na ativação da conta por convite. */
export function useCadastroValidationMessages(): CadastroValidationMessages {
  const t = useTranslations("auth.register");

  return {
    fullNameRequired: t("validation.fullNameRequired"),
    fullNameLastName: t("validation.fullNameLastName"),
    fullNameMaxLength: t("validation.fullNameMaxLength"),
    employeeCodeRequired: t("validation.employeeCodeRequired"),
    employeeCodeMaxLength: t("validation.employeeCodeMaxLength"),
    departmentRequired: t("validation.departmentRequired"),
    departmentMaxLength: t("validation.departmentMaxLength"),
    companyRequired: t("validation.companyRequired"),
    companyMaxLength: t("validation.companyMaxLength"),
    emailRequired: t("validation.emailRequired"),
    emailInvalid: t("validation.emailInvalid"),
    emailMaxLength: t("validation.emailMaxLength"),
    passwordRequired: t("validation.passwordRequired"),
    passwordMinLength: t("validation.passwordMinLength"),
    passwordMaxLength: t("validation.passwordMaxLength"),
    confirmPasswordRequired: t("validation.confirmPasswordRequired"),
    passwordsDoNotMatch: t("validation.passwordsDoNotMatch"),
    termsRequired: t("validation.termsRequired"),
  };
}

/**
 * Dados pessoais e senha da conta, com as regras do POST /auth/register. O
 * cadastro acrescenta o e-mail e o aceite dos termos; a ativação por convite
 * usa só estes campos, já que o e-mail vem do link.
 */
export function buildAccountDataSchema(messages: CadastroValidationMessages) {
  return z.object({
    nomeCompleto: z
      .string()
      .trim()
      .min(1, messages.fullNameRequired)
      .regex(FULL_NAME_PATTERN, messages.fullNameLastName)
      .max(50, messages.fullNameMaxLength),
    codigoFuncionario: z
      .string()
      .trim()
      .min(1, messages.employeeCodeRequired)
      .max(50, messages.employeeCodeMaxLength),
    departamento: z
      .string()
      .trim()
      .min(1, messages.departmentRequired)
      .max(100, messages.departmentMaxLength),
    empresa: z
      .string()
      .trim()
      .min(1, messages.companyRequired)
      .max(100, messages.companyMaxLength),
    senha: z
      .string()
      .trim()
      .min(1, messages.passwordRequired)
      .min(8, messages.passwordMinLength)
      .max(100, messages.passwordMaxLength),
    confirmarSenha: z
      .string()
      .trim()
      .min(1, messages.confirmPasswordRequired),
  });
}

/** Confere se a confirmação é igual à senha, com o erro no campo da confirmação. */
export function withPasswordConfirmation<T extends z.ZodType<{ senha: string; confirmarSenha: string }>>(
  schema: T,
  message: string
) {
  return schema.refine((data) => data.senha === data.confirmarSenha, {
    message,
    path: ["confirmarSenha"],
  });
}
