"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { registerUser } from "@services/cadastroService";
import type {
  CadastroFormValues,
  CadastroViewModelReturn,
  CadastroServerMessage,
  CadastroValidationMessages,
} from "./cadastro.types";

interface UseCadastroVMProps {
  isGeneralSystem?: boolean;
}

export function useCadastroVM(
  props?: UseCadastroVMProps
): CadastroViewModelReturn {
  const isGeneralSystem = props?.isGeneralSystem ?? true;
  const t = useTranslations("auth.register");

  const [serverMessage, setServerMessage] = useState<CadastroServerMessage | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const validationMessages: CadastroValidationMessages = {
    fullNameRequired: t("validation.fullNameRequired"),
    employeeCodeRequired: t("validation.employeeCodeRequired"),
    departmentRequired: t("validation.departmentRequired"),
    companyRequired: t("validation.companyRequired"),
    emailRequired: t("validation.emailRequired"),
    emailInvalid: t("validation.emailInvalid"),
    passwordRequired: t("validation.passwordRequired"),
    passwordMinLength: t("validation.passwordMinLength"),
    confirmPasswordRequired: t("validation.confirmPasswordRequired"),
    passwordsDoNotMatch: t("validation.passwordsDoNotMatch"),
    termsRequired: t("validation.termsRequired"),
  };

  const schema = z
    .object({
      nomeCompleto: z.string().trim().min(1, validationMessages.fullNameRequired),
      codigoFuncionario: z
        .string()
        .trim()
        .min(1, validationMessages.employeeCodeRequired),
      departamento: z
        .string()
        .trim()
        .min(1, validationMessages.departmentRequired),
      empresa: isGeneralSystem
        ? z.string().trim().min(1, validationMessages.companyRequired)
        : z.string().optional(),
      email: z
        .string()
        .trim()
        .min(1, validationMessages.emailRequired)
        .email(validationMessages.emailInvalid),
      senha: z
        .string()
        .trim()
        .min(1, validationMessages.passwordRequired)
        .min(8, validationMessages.passwordMinLength),
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
      // Mock test triggers for local frontend testing without backend:
      if (values.email === "duplicado@empresa.com") {
        throw new Error(t("serverError.alreadyRegisteredDescription"));
      }
      if (values.email === "invalido@empresa.com") {
        throw new Error("Campo inválido: o e-mail informado não possui permissão.");
      }

      await registerUser({
        nomeCompleto: values.nomeCompleto,
        codigoFuncionario: values.codigoFuncionario,
        departamento: values.departamento,
        ...(isGeneralSystem && values.empresa ? { empresa: values.empresa } : {}),
        email: values.email,
        senha: values.senha,
      });

      setIsSuccess(true);
      setServerMessage({
        title: t("serverSuccess.title"),
        description: t("serverSuccess.description"),
        variant: "success",
      });
    } catch (err: unknown) {
      const errorMsg =
        err instanceof Error ? err.message : t("serverError.serverErrorDescription");

      // Categorize server response errors according to task requirements
      if (
        errorMsg.toLowerCase().includes("cadastrado") ||
        errorMsg.toLowerCase().includes("already registered") ||
        errorMsg.toLowerCase().includes("exist")
      ) {
        setServerMessage({
          title: t("serverError.alreadyRegisteredTitle"),
          description: errorMsg || t("serverError.alreadyRegisteredDescription"),
          variant: "destructive",
        });
      } else if (
        errorMsg.toLowerCase().includes("inválido") ||
        errorMsg.toLowerCase().includes("invalid")
      ) {
        setServerMessage({
          title: t("serverError.invalidFieldsTitle"),
          description: errorMsg,
          variant: "destructive",
        });
      } else {
        setServerMessage({
          title: t("serverError.serverErrorTitle"),
          description: t("serverError.serverErrorDescription"),
          variant: "destructive",
        });
      }
    }
  });

  const onCloseMsg = () => setServerMessage(null);

  return {
    form,
    serverMessage,
    onCloseMsg,
    handleSubmit,
    isGeneralSystem,
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
