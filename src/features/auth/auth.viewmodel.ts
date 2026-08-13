"use client";

import { useTranslations } from "next-intl";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useState } from "react";

import { login } from "@services/authService";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "@/shared/i18n/navigation";
import type { AuthViewModelReturn, LoginFormValues } from "./auth.types";

export function useAuthVM(): AuthViewModelReturn {
  const t = useTranslations("auth.login");
  const router = useRouter();
  const { setAuth } = useAuth();
  const [serverMessage, setServerMessage] =
    useState<AuthViewModelReturn["serverMessage"]>(null);
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
    setServerMessage(null);
    try {
      const user = await login(data);
      setAuth(user);
      router.push("/painel");
    } catch (err: unknown) {
      const description =
        err instanceof Error ? err.message : t("serverError.genericDescription");
      setServerMessage({
        title: t("serverError.title"),
        description,
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
    labels: {
      title: t("title"),
      description: t("description"),
      welcomeTitle: t("welcomeTitle"),
      welcomeDescription: t("welcomeDescription"),
      emailLabel: t("emailLabel"),
      emailPlaceholder: t("emailPlaceholder"),
      passwordLabel: t("passwordLabel"),
      passwordPlaceholder: t("passwordPlaceholder"),
      forgotPassword: t("forgotPassword"),
      submit: t("submit"),
      signUpPrefix: t("signUpPrefix"),
      signUpLink: t("signUpLink"),
      privacyNotice: t("privacyNotice"),
    },
  };
}
