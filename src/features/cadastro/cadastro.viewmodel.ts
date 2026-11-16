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
} from "./cadastro.types";
import {
  buildAccountDataSchema,
  useCadastroValidationMessages,
  withPasswordConfirmation,
} from "./cadastro.validation";

export function useCadastroVM(): CadastroViewModelReturn {
  const t = useTranslations("auth.register");

  const [serverMessage, setServerMessage] =
    useState<CadastroServerMessage | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const validationMessages = useCadastroValidationMessages();

  const schema = withPasswordConfirmation(
    buildAccountDataSchema(validationMessages).extend({
      email: z
        .string()
        .trim()
        .min(1, validationMessages.emailRequired)
        .email(validationMessages.emailInvalid)
        .max(100, validationMessages.emailMaxLength),
      aceitouTermos: z.boolean().refine((val) => val === true, {
        message: validationMessages.termsRequired,
      }),
    }),
    validationMessages.passwordsDoNotMatch
  );

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
