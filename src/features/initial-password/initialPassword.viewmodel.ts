"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";

import {
  buildAccountDataSchema,
  useCadastroValidationMessages,
  withPasswordConfirmation,
} from "@features/cadastro/cadastro.validation";
import {
  InvitationRequestError,
  completeInvitation,
  validateInvitation,
} from "@services/invitationService";
import { useRouter } from "@/shared/i18n/navigation";
import { buildAccountActivatedLoginPath } from "@/shared/utils/loginRedirect";
import type {
  InitialPasswordFormValues,
  InitialPasswordServerMessage,
  InitialPasswordStatus,
  InitialPasswordViewModelReturn,
} from "./initialPassword.types";

function isInvalidInvitation(err: unknown): boolean {
  return err instanceof InvitationRequestError && err.type === "invalid_invitation";
}

export function useInitialPasswordVM(): InitialPasswordViewModelReturn {
  const t = useTranslations("auth.initialPassword");
  const tRegister = useTranslations("auth.register");
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email")?.trim() ?? "";
  const token = searchParams.get("token")?.trim() ?? "";
  const hasCredentials = email !== "" && token !== "";

  // O convite pode expirar entre a abertura do link e o envio
  const [hasExpiredOnSubmit, setHasExpiredOnSubmit] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [serverMessage, setServerMessage] = useState<InitialPasswordServerMessage | null>(null);

  const validationQuery = useQuery({
    // O código fica só na memória: gcTime 0 descarta a consulta ao sair da página
    queryKey: ["invitation-validation", email, token],
    queryFn: () => validateInvitation({ email, token }),
    enabled: hasCredentials,
    retry: false,
    gcTime: 0,
    staleTime: Infinity,
  });

  const validationMessages = useCadastroValidationMessages();
  const schema = withPasswordConfirmation(
    buildAccountDataSchema(validationMessages),
    validationMessages.passwordsDoNotMatch
  );

  const form = useForm<InitialPasswordFormValues>({
    resolver: zodResolver(schema) as Resolver<InitialPasswordFormValues>,
    mode: "onSubmit",
    reValidateMode: "onChange",
    defaultValues: {
      nomeCompleto: "",
      empresa: "",
      departamento: "",
      codigoFuncionario: "",
      senha: "",
      confirmarSenha: "",
    },
  });

  // Access formState.errors to ensure React Hook Form proxy tracks error state
  void form.formState.errors;

  function getStatus(): InitialPasswordStatus {
    if (!hasCredentials || hasExpiredOnSubmit) return "invalid";
    if (validationQuery.isFetching || validationQuery.isPending) return "validating";
    if (validationQuery.isError) {
      return isInvalidInvitation(validationQuery.error) ? "invalid" : "validation_failed";
    }
    return "ready";
  }

  const handleSubmit = form.handleSubmit(async (values) => {
    setServerMessage(null);
    try {
      await completeInvitation({ email, token }, values);
      setIsRedirecting(true);
      // replace: voltar no navegador não reabre o link já usado
      router.replace(buildAccountActivatedLoginPath());
    } catch (err: unknown) {
      if (isInvalidInvitation(err)) {
        setHasExpiredOnSubmit(true);
        return;
      }

      if (err instanceof InvitationRequestError && err.type === "validation") {
        for (const [field, message] of Object.entries(err.fieldErrors)) {
          if (message) {
            form.setError(field as keyof InitialPasswordFormValues, { type: "server", message });
          }
        }
        // Mensagens de campos fora do formulário ficam no aviso
        if (err.otherErrors.length > 0) {
          setServerMessage({
            title: t("submitError"),
            description: err.otherErrors.join(" "),
            variant: "destructive",
          });
        }
        return;
      }

      setServerMessage({ title: t("submitError"), variant: "destructive" });
    }
  });

  return {
    status: getStatus(),
    email,
    form,
    isSubmitting: form.formState.isSubmitting || isRedirecting,
    serverMessage,
    onCloseMsg: () => setServerMessage(null),
    handleSubmit,
    handleRetry: () => {
      void validationQuery.refetch();
    },
    labels: {
      appName: tRegister("title"),
      tagline: tRegister("description"),
      title: t("title"),
      subtitle: t("subtitle"),
      validating: t("validating"),
      invalidInvitation: t("invalidInvitation"),
      backToLogin: t("backToLogin"),
      validationFailed: t("validationFailed"),
      retry: t("retry"),
      emailLabel: t("emailLabel"),
      fullNameLabel: tRegister("fullNameLabel"),
      fullNamePlaceholder: tRegister("fullNamePlaceholder"),
      companyLabel: tRegister("companyLabel"),
      companyPlaceholder: tRegister("companyPlaceholder"),
      departmentLabel: tRegister("departmentLabel"),
      departmentPlaceholder: tRegister("departmentPlaceholder"),
      employeeCodeLabel: tRegister("employeeCodeLabel"),
      employeeCodePlaceholder: tRegister("employeeCodePlaceholder"),
      passwordLabel: tRegister("passwordLabel"),
      passwordPlaceholder: tRegister("passwordPlaceholder"),
      confirmPasswordLabel: tRegister("confirmPasswordLabel"),
      confirmPasswordPlaceholder: tRegister("confirmPasswordPlaceholder"),
      submit: t("submit"),
      submitting: t("submitting"),
    },
  };
}
