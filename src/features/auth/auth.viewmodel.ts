"use client";

import { useTranslations } from "next-intl";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useState } from "react";

import type { AuthViewModelReturn, LoginFormValues } from "./auth.types";

export function useAuthVM(): AuthViewModelReturn {
  const t = useTranslations("auth.login");
  const [serverMessage, setServerMessage] =
    useState<AuthViewModelReturn["serverMessage"]>(null);
  const validationMessages = {
    usernameRequired: t("validation.usernameRequired"),
    passwordRequired: t("validation.passwordRequired"),
  };

  const loginSchema = z.object({
    username: z.string().trim().min(1, validationMessages.usernameRequired),
    password: z.string().trim().min(1, validationMessages.passwordRequired),
  });

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    mode: "onChange",
    reValidateMode: "onChange",
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const handleSubmit = form.handleSubmit((data) => {
    // Test msg, remove when implementing actual server logic
    setServerMessage({
      title: "Erro de servidor",
      description: "Usuário ou senha inválidos. Por favor, tente novamente.",
      variant: "destructive",
    });

    // Handle form submission logic here
    console.log("Form submitted with data:", data);
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
      usernameLabel: t("usernameLabel"),
      usernamePlaceholder: t("usernamePlaceholder"),
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
