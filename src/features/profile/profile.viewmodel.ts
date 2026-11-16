"use client";

import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, type Resolver } from "react-hook-form";
import { z } from "zod";
import { useTranslations } from "next-intl";
import { ApiRequestError } from "@services/httpClient";
import {
  getOwnProfile,
  getProfileActivity,
  updateOwnProfile,
} from "@services/profileService";
import { useAuthStore } from "@features/auth/auth.store";
import { useTheme } from "@hooks/useTheme";
import { useLang } from "@hooks/useLang";
import { localeNames, type Locale } from "@shared/i18n/routing";
import type { ThemeMode } from "@shared/theme";
import type {
  ProfileEditableField,
  ProfileFormValues,
  ProfileLabels,
  ProfileLanguageOption,
  ProfileServerMessage,
  ProfileUpdatePayload,
  ProfileViewModelReturn,
  UserProfile,
} from "./profile.types";
import { getInitials } from "@/shared/utils/initials";

const FULL_NAME_PATTERN = /^\S+\s+\S+/u;

const EDITABLE_FIELDS: ProfileEditableField[] = [
  "name",
  "organization",
  "email",
  "department",
];

/** Campos editáveis que mudaram em relação ao perfil salvo, já sem espaços nas pontas. */
function getChangedFields(
  values: ProfileFormValues,
  current: UserProfile,
): ProfileUpdatePayload {
  const payload: ProfileUpdatePayload = {};
  for (const field of EDITABLE_FIELDS) {
    const value = values[field].trim();
    if (value !== current[field]) payload[field] = value;
  }
  return payload;
}

function isEditableField(field: string): field is ProfileEditableField {
  return (EDITABLE_FIELDS as string[]).includes(field);
}

export function useProfileVM(): ProfileViewModelReturn {
  const t = useTranslations("profile");
  const { locale, locales, changeLocale } = useLang();
  const { theme, setThemeMode } = useTheme();
  const user = useAuthStore((state) => state.user);
  const setAuth = useAuthStore((state) => state.setAuth);
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [serverMessage, setServerMessage] =
    useState<ProfileServerMessage | null>(null);

  const labels: ProfileLabels = {
    title: t("title"),
    subtitle: t("subtitle"),
    editProfile: t("editProfile"),
    personalData: t("personalData"),
    fullName: t("fullName"),
    organization: t("organization"),
    email: t("email"),
    employeeCode: t("employeeCode"),
    department: t("department"),
    employeeCodeHelp: t("employeeCodeHelp"),
    notProvided: t("notProvided"),
    save: t("save"),
    cancel: t("cancel"),
    activityTitle: t("activityTitle"),
    completedJourneys: t("completedJourneys"),
    inProgressJourneys: t("inProgressJourneys"),
    privacyAverage: t("privacyAverage"),
    securityAverage: t("securityAverage"),
    combinedAverage: t("combinedAverage"),
    loading: t("loading"),
    loadErrorTitle: t("loadErrorTitle"),
    loadErrorDescription: t("loadErrorDescription"),
    retry: t("retry"),
    activityLoadError: t("activityLoadError"),
    notAvailable: t("notAvailable"),
    successTitle: t("successTitle"),
    successDescription: t("successDescription"),
    errorTitle: t("errorTitle"),
    unauthorizedError: t("unauthorizedError"),
    serverError: t("serverError"),
    genericError: t("genericError"),
    closeMessage: t("closeMessage"),
    validation: {
      nameRequired: t("validation.nameRequired"),
      nameLastName: t("validation.nameLastName"),
      nameMaxLength: t("validation.nameMaxLength"),
      organizationRequired: t("validation.organizationRequired"),
      organizationMaxLength: t("validation.organizationMaxLength"),
      emailRequired: t("validation.emailRequired"),
      emailInvalid: t("validation.emailInvalid"),
      emailMaxLength: t("validation.emailMaxLength"),
      departmentRequired: t("validation.departmentRequired"),
      departmentMaxLength: t("validation.departmentMaxLength"),
      employeeCodeImmutable: t("validation.employeeCodeImmutable"),
      emailInUse: t("validation.emailInUse"),
    },
    preferencesTitle: t("preferencesTitle"),
    language: t("language"),
    theme: t("theme"),
    themeLight: t("themeLight"),
    themeDark: t("themeDark"),
    themeHighContrast: t("themeHighContrast"),
    themeHighContrastUnavailable: t("themeHighContrastUnavailable"),
  };

  const userId = user?.id;

  const profileQuery = useQuery({
    queryKey: ["profile", userId],
    queryFn: getOwnProfile,
    enabled: userId != null,
    retry: false,
  });
  const profile = profileQuery.data ?? null;

  // Consulta separada: se as métricas falharem, os dados pessoais continuam na tela
  const activityQuery = useQuery({
    queryKey: ["profile", "activity", userId],
    queryFn: () => getProfileActivity(userId as number),
    enabled: userId != null,
    retry: false,
  });
  const activity = activityQuery.data ?? null;

  const schema = useMemo(
    () =>
      z
        .object({
          name: z
            .string()
            .trim()
            .min(1, labels.validation.nameRequired)
            .regex(FULL_NAME_PATTERN, labels.validation.nameLastName)
            .max(50, labels.validation.nameMaxLength),
          organization: z
            .string()
            .trim()
            .min(1, labels.validation.organizationRequired)
            .max(100, labels.validation.organizationMaxLength),
          email: z
            .string()
            .trim()
            .min(1, labels.validation.emailRequired)
            .email(labels.validation.emailInvalid)
            .max(100, labels.validation.emailMaxLength),
          employeeCode: z.string(),
          department: z
            .string()
            .trim()
            .min(1, labels.validation.departmentRequired)
            .max(100, labels.validation.departmentMaxLength),
        })
        .superRefine((values, context) => {
          if (profile && values.employeeCode !== profile.employeeCode) {
            context.addIssue({
              code: "custom",
              path: ["employeeCode"],
              message: labels.validation.employeeCodeImmutable,
            });
          }
        }),
    [labels.validation, profile],
  );

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(schema) as Resolver<ProfileFormValues>,
    mode: "onSubmit",
    reValidateMode: "onChange",
    defaultValues: {
      name: "",
      organization: "",
      email: "",
      employeeCode: "",
      department: "",
    },
  });
  const { reset } = form;

  useEffect(() => {
    if (profile) {
      reset(profile);
    }
  }, [profile, reset]);

  const updateMutation = useMutation({
    mutationFn: (payload: ProfileUpdatePayload) => updateOwnProfile(payload),
  });

  const showSuccess = () => {
    setIsEditing(false);
    setServerMessage({
      title: labels.successTitle,
      description: labels.successDescription,
      variant: "success",
    });
  };

  const handleSubmit = form.handleSubmit(async (values) => {
    if (!user || !profile) {
      setServerMessage({
        title: labels.errorTitle,
        description: labels.genericError,
        variant: "destructive",
      });
      return;
    }

    setServerMessage(null);
    const payload = getChangedFields(values, profile);

    // Nada mudou: só sai da edição, sem chamar o backend
    if (Object.keys(payload).length === 0) {
      reset(profile);
      setIsEditing(false);
      return;
    }

    try {
      const savedProfile = await updateMutation.mutateAsync(payload);
      queryClient.setQueryData(["profile", user.id], savedProfile);
      // O usuário do store é o /me carregado na sessão: atualiza o nome da barra lateral
      setAuth({
        ...user,
        name: savedProfile.name,
        email: savedProfile.email,
        organization: savedProfile.organization,
      });
      reset(savedProfile);
      showSuccess();
    } catch (error: unknown) {
      const apiError = error instanceof ApiRequestError ? error : undefined;
      const status = apiError?.status;

      if (status === 409 && apiError?.code === "EMAIL_ALREADY_IN_USE") {
        form.setError("email", { type: "server", message: labels.validation.emailInUse });
        return;
      }

      if (status === 422 && apiError?.errors) {
        let hasFieldError = false;
        for (const [field, messages] of Object.entries(apiError.errors)) {
          if (isEditableField(field) && messages[0]) {
            form.setError(field, { type: "server", message: messages[0] });
            hasFieldError = true;
          }
        }
        if (hasFieldError) return;
      }

      const description =
        status === 401
          ? labels.unauthorizedError
          : status !== undefined && status >= 500
            ? labels.serverError
            : labels.genericError;
      setServerMessage({
        title: labels.errorTitle,
        description,
        variant: "destructive",
      });
    }
  });

  const handleEdit = () => {
    if (!profile) return;
    reset(profile);
    setServerMessage(null);
    setIsEditing(true);
  };

  const handleCancel = () => {
    if (profile) reset(profile);
    setIsEditing(false);
    setServerMessage(null);
  };

  const handleRetry = () => {
    void profileQuery.refetch();
    void activityQuery.refetch();
  };

  const handleRetryActivity = () => {
    void activityQuery.refetch();
  };

  const formatAverage = (average: number | null | undefined) =>
    average == null ? labels.notAvailable : Math.round(average);

  const handleCloseMessage = () => setServerMessage(null);

  const handleLocaleChange = (nextLocale: Locale) => {
    changeLocale(nextLocale);
  };

  const handleThemeChange = (mode: ThemeMode) => {
    setThemeMode(mode);
  };

  const languageOptions: ProfileLanguageOption[] = useMemo(
    () =>
      locales.map((item) => ({
        locale: item,
        label: localeNames[item],
      })),
    [locales],
  );

  const metrics = [
    {
      id: "completed-journeys",
      label: labels.completedJourneys,
      value: activity?.completedJourneys ?? 0,
    },
    {
      id: "in-progress-journeys",
      label: labels.inProgressJourneys,
      value: activity?.inProgressJourneys ?? 0,
    },
    {
      id: "privacy-average",
      label: labels.privacyAverage,
      value: formatAverage(activity?.averageByDomain.privacy),
    },
    {
      id: "security-average",
      label: labels.securityAverage,
      value: formatAverage(activity?.averageByDomain.security),
    },
    {
      id: "combined-average",
      label: labels.combinedAverage,
      value: formatAverage(activity?.averageByDomain.combined),
    },
  ];

  return {
    profile,
    initials: profile ? getInitials(profile.name) : "",
    form,
    isLoading: profileQuery.isLoading,
    isLoadError: profileQuery.isError,
    isActivityLoading: activityQuery.isLoading,
    isActivityError: activityQuery.isError,
    isEditing,
    isSubmitting: form.formState.isSubmitting || updateMutation.isPending,
    serverMessage,
    metrics,
    locale,
    languageOptions,
    theme,
    labels,
    handleEdit,
    handleCancel,
    handleSubmit,
    handleRetry,
    handleRetryActivity,
    handleCloseMessage,
    handleLocaleChange,
    handleThemeChange,
  };
}
