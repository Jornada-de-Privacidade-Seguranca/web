"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { CadastroRequestError, registerUser } from "@services/cadastroService";
import type {
  CadastroFormValues,
  CadastroViewModelReturn,
  CadastroServerMessage,
  CadastroValidationMessages,
} from "./cadastro.types";

/** Nome e sobrenome, a mesma regra do POST /auth/register. */
const FULL_NAME_PATTERN = /^\S+\s+\S+/u;

export function useCadastroVM(): CadastroViewModelReturn {
  const t = useTranslations("auth.register");

  const [serverMessage, setServerMessage] =
    useState<CadastroServerMessage | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const validationMessages: CadastroValidationMessages = {
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

  const schema = z
    .object({
      nomeCompleto: z
        .string()
        .trim()
        .min(1, validationMessages.fullNameRequired)
        .regex(FULL_NAME_PATTERN, validationMessages.fullNameLastName)
        .max(50, validationMessages.fullNameMaxLength),
      codigoFuncionario: z
        .string()
        .trim()
        .min(1, validationMessages.employeeCodeRequired)
        .max(50, validationMessages.employeeCodeMaxLength),
      departamento: z
        .string()
        .trim()
        .min(1, validationMessages.departmentRequired)
        .max(100, validationMessages.departmentMaxLength),
      empresa: z
        .string()
        .trim()
        .min(1, validationMessages.companyRequired)
        .max(100, validationMessages.companyMaxLength),
      email: z
        .string()
        .trim()
        .min(1, validationMessages.emailRequired)
        .email(validationMessages.emailInvalid)
        .max(100, validationMessages.emailMaxLength),
      senha: z
        .string()
        .trim()
        .min(1, validationMessages.passwordRequired)
        .min(8, validationMessages.passwordMinLength)
        .max(100, validationMessages.passwordMaxLength),
      confirmarSenha: z
        .string()
        .trim()
        .min(1, validationMessages.confirmPasswordRequired),
      aceitouTermos: z.boolean().refine((val) => val === true, {
        message: validationMessages.termsRequired,
      }),
    })
    .refine((data) => data.senha === data.confirmarSenha, {
      message: validationMessages.passwordsDoNotMatch,
      path: ["confirmarSenha"],
    });

  const form = useForm<CadastroFormValues>({
    resolver: zodResolver(schema) as Resolver<CadastroFormValues>,
    mode: "onSubmit",
    reValidateMode: "onChange",
    defaultValues: {
      nomeCompleto: "",
      codigoFuncionario: "",
      departamento: "",
      empresa: "",
      email: "",
      senha: "",
      confirmarSenha: "",
      aceitouTermos: false,
    },
  });

  // Access formState.errors to ensure React Hook Form proxy tracks error state
  void form.formState.errors;

  const handleSubmit = form.handleSubmit(async (values) => {
    setServerMessage(null);
    try {
      await registerUser({
        nomeCompleto: values.nomeCompleto,
        codigoFuncionario: values.codigoFuncionario,
        departamento: values.departamento,
        empresa: values.empresa,
        email: values.email,
        senha: values.senha,
        confirmarSenha: values.confirmarSenha,
      });

      setIsSuccess(true);
      setServerMessage({
        title: t("serverSuccess.title"),
        description: t("serverSuccess.description"),
        variant: "success",
      });
    } catch (err: unknown) {
      const type = err instanceof CadastroRequestError ? err.type : "server_error";

      if (type === "already_registered") {
        setServerMessage({
          title: t("serverError.alreadyRegisteredTitle"),
          description: t("serverError.alreadyRegisteredDescription"),
          variant: "destructive",
        });
        return;
      }

      if (type === "validation" && err instanceof CadastroRequestError) {
        // Cada mensagem vai para o seu campo; as de campos fora do formulário ficam no aviso
        for (const [field, message] of Object.entries(err.fieldErrors)) {
          if (message) {
            form.setError(field as keyof CadastroFormValues, { type: "server", message });
          }
        }
        setServerMessage({
          title: t("serverError.invalidFieldsTitle"),
          description: err.otherErrors.length > 0 ? err.otherErrors.join(" ") : undefined,
          variant: "destructive",
        });
        return;
      }

      setServerMessage({
        title: t("serverError.serverErrorTitle"),
        description: t("serverError.serverErrorDescription"),
        variant: "destructive",
      });
    }
  });

  const onCloseMsg = () => setServerMessage(null);

  return {
    form,
    serverMessage,
    onCloseMsg,
    handleSubmit,
    isSuccess,
    labels: {
      title: t("title"),
      description: t("description"),
      cardTitle: t("cardTitle"),
      cardSubtitle: t("cardSubtitle"),
      fullNameLabel: t("fullNameLabel"),
      fullNamePlaceholder: t("fullNamePlaceholder"),
      employeeCodeLabel: t("employeeCodeLabel"),
      employeeCodePlaceholder: t("employeeCodePlaceholder"),
      departmentLabel: t("departmentLabel"),
      departmentPlaceholder: t("departmentPlaceholder"),
      companyLabel: t("companyLabel"),
      companyPlaceholder: t("companyPlaceholder"),
      emailLabel: t("emailLabel"),
      emailPlaceholder: t("emailPlaceholder"),
      passwordLabel: t("passwordLabel"),
      passwordPlaceholder: t("passwordPlaceholder"),
      confirmPasswordLabel: t("confirmPasswordLabel"),
      confirmPasswordPlaceholder: t("confirmPasswordPlaceholder"),
      termsCheckbox: t("termsCheckbox"),
      submit: t("submit"),
      hasAccountText: t("hasAccountText"),
      loginLink: t("loginLink"),
    },
  };
}
