"use client";

import { useTranslations } from "next-intl";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";

import { login } from "@services/authService";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "@/shared/i18n/navigation";
import {
  DEFAULT_AUTHENTICATED_PATH,
  isAccountActivatedLogin,
  isSessionExpiredLogin,
  readLoginRedirectPath,
} from "@/shared/utils/loginRedirect";
import type { AuthViewModelReturn, LoginFormValues } from "./auth.types";

export function useAuthVM(): AuthViewModelReturn {
  const t = useTranslations("auth.login");
  const router = useRouter();
  const queryClient = useQueryClient();
  const { setAuth } = useAuth();
  const tSessionExpired = useTranslations("sessionExpired");
  // useSearchParams acompanha a navegação até o login, inclusive a interna
  const searchParams = useSearchParams();
  const search = searchParams.toString();
  const redirectPath = readLoginRedirectPath(search);
  const [isReasonNoticeDismissed, setIsReasonNoticeDismissed] = useState(false);
  const [requestMessage, setRequestMessage] =
    useState<AuthViewModelReturn["serverMessage"]>(null);
  // Vindo da expiração da sessão ou da ativação da conta, o login avisa até o
  // usuário fechar ou tentar entrar
  const reasonNotice = getReasonNotice();
  const serverMessage = requestMessage ?? (isReasonNoticeDismissed ? null : reasonNotice);
  const validationMessages = {
    emailRequired: t("validation.emailRequired"),
    emailInvalid: t("validation.emailInvalid"),
    passwordRequired: t("validation.passwordRequired"),
  };

  const loginSchema = z.object({
    email: z
      .string()
      .trim()
      .min(1, validationMessages.emailRequired)
      .email(validationMessages.emailInvalid),
    password: z.string().trim().min(1, validationMessages.passwordRequired),
  });

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    mode: "onChange",
    reValidateMode: "onChange",
    defaultValues: {
      email: "",
      password: "",
    },
  });

  // Access formState.errors to ensure React Hook Form proxy tracks error state
  void form.formState.errors;

  const handleSubmit = form.handleSubmit(async (data) => {
    setRequestMessage(null);
    setIsReasonNoticeDismissed(true);
    try {
      const user = await login(data);
      // Dados em cache podem ser de quem usava a aba antes (sessão expirada ou
      // logout): o app volta a buscar tudo para o usuário que acabou de entrar
      queryClient.clear();
      setAuth(user);
      router.push(redirectPath ?? DEFAULT_AUTHENTICATED_PATH);
    } catch (err: unknown) {
      const description =
        err instanceof Error ? err.message : t("serverError.genericDescription");
      setRequestMessage({
        title: t("serverError.title"),
        description,
        variant: "destructive",
      });
    }
  });

  function getReasonNotice(): AuthViewModelReturn["serverMessage"] {
    if (isSessionExpiredLogin(search)) {
      return {
        title: tSessionExpired("title"),
        description: tSessionExpired("description"),
        variant: "warning",
      };
    }
    if (isAccountActivatedLogin(search)) {
      return {
        title: t("accountActivated.title"),
        description: t("accountActivated.description"),
        variant: "success",
      };
    }
    return null;
  }

  const onCloseMsg = () => {
    setRequestMessage(null);
    setIsReasonNoticeDismissed(true);
  };

  return {
    form,
    serverMessage,
    onCloseMsg,
    handleSubmit,
    labels: {
      title: t("title"),
      description: t("description"),
      welcomeTitle: t("welcomeTitle"),
      welcomeDescription: t("welcomeDescription"),
      emailLabel: t("emailLabel"),
      emailPlaceholder: t("emailPlaceholder"),
      passwordLabel: t("passwordLabel"),
      passwordPlaceholder: t("passwordPlaceholder"),
      submit: t("submit"),
      signUpPrefix: t("signUpPrefix"),
      signUpLink: t("signUpLink"),
      privacyNoticePrefix: t("privacyNotice.prefix"),
      privacyNoticeLink: t("privacyNotice.link"),
      privacyNoticeSuffix: t("privacyNotice.suffix"),
      privacyNoticeLinkAriaLabel: t("privacyNotice.linkAriaLabel"),
    },
  };
}
