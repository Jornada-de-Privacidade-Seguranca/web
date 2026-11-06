"use client";

import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, type Resolver } from "react-hook-form";
import { z } from "zod";
import { useTranslations } from "next-intl";
import { ApiRequestError } from "@services/httpClient";
import { getUserProfile, updateUserProfile } from "@services/profileService";
import { useAuthStore } from "@features/auth/auth.store";
import { useTheme } from "@hooks/useTheme";
import type {
  ProfileData,
  ProfileFormValues,
  ProfileLabels,
  ProfileServerMessage,
  ProfileUpdatePayload,
  ProfileViewModelReturn,
} from "./profile.types";
import { getInitials } from "@/shared/utils/initials";

const FULL_NAME_PATTERN = /^\S+\s+\S+/u;

export function useProfileVM(): ProfileViewModelReturn {
  const t = useTranslations("profile");
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
    },
    preferencesTitle: t("preferencesTitle"),
    language: t("language"),
    theme: t("theme"),
    themeLight: t("themeLight"),
    themeDark: t("themeDark"),
    themeHighContrast: t("themeHighContrast"),
    themeHighContrastUnavailable: t("themeHighContrastUnavailable"),
  };

  const profileQuery = useQuery({
    queryKey: ["profile", user?.id],
    queryFn: () => {
      if (!user) {
        throw new Error(labels.loadErrorDescription);
      }
      return getUserProfile(user);
    },
    enabled: Boolean(user),
    retry: false,
  });
  const profile = profileQuery.data ?? null;

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
          if (profile && values.employeeCode !== profile.user.employeeCode) {
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
      reset(profile.user);
    }
  }, [profile, reset]);

  const updateMutation = useMutation({
    mutationFn: ({
      currentProfile,
      payload,
    }: {
      currentProfile: ProfileData;
      payload: ProfileUpdatePayload;
    }) => {
      if (!user) {
        throw new Error(labels.genericError);
      }
      return updateUserProfile(user, currentProfile, payload);
    },
  });

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
    const payload: ProfileUpdatePayload = {
      name: values.name.trim(),
      organization: values.organization.trim(),
      email: values.email.trim(),
      department: values.department.trim(),
    };

    try {
      const savedProfile = await updateMutation.mutateAsync({
        currentProfile: profile,
        payload,
      });
      const updatedProfile: ProfileData = {
        ...savedProfile,
        user: {
          ...savedProfile.user,
          employeeCode: profile.user.employeeCode,
        },
      };
      queryClient.setQueryData(["profile", user.id], updatedProfile);
      setAuth({ ...user, name: updatedProfile.user.name, email: updatedProfile.user.email });
      reset(updatedProfile.user);
      setIsEditing(false);
      setServerMessage({
        title: labels.successTitle,
        description: labels.successDescription,
        variant: "success",
      });
    } catch (error: unknown) {
      const status = error instanceof ApiRequestError ? error.status : undefined;
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
    reset(profile.user);
    setServerMessage(null);
    setIsEditing(true);
  };

  const handleCancel = () => {
    if (profile) reset(profile.user);
    setIsEditing(false);
    setServerMessage(null);
  };

  const handleRetry = () => {
    void profileQuery.refetch();
  };

  const handleCloseMessage = () => setServerMessage(null);

  const handleThemeChange = (mode: "light" | "dark") => {
    setThemeMode(mode);
  };

  const metrics = [
    {
      id: "completed-journeys",
      label: labels.completedJourneys,
      value: profile?.activity.completedJourneys ?? 0,
    },
    {
      id: "in-progress-journeys",
      label: labels.inProgressJourneys,
      value: profile?.activity.inProgressJourneys ?? 0,
    },
    {
      id: "privacy-average",
      label: labels.privacyAverage,
      value: profile?.activity.averageByDomain.privacy ?? 0,
    },
    {
      id: "security-average",
      label: labels.securityAverage,
      value: profile?.activity.averageByDomain.security ?? 0,
    },
    {
      id: "combined-average",
      label: labels.combinedAverage,
      value: profile?.activity.averageByDomain.combined ?? 0,
    },
  ];

  return {
    profile,
    initials: profile ? getInitials(profile.user.name) : "",
    form,
    isLoading: profileQuery.isLoading,
    isLoadError: profileQuery.isError,
    isEditing,
    isSubmitting: form.formState.isSubmitting || updateMutation.isPending,
    serverMessage,
    metrics,
    theme,
    labels,
    handleEdit,
    handleCancel,
    handleSubmit,
    handleRetry,
    handleCloseMessage,
    handleThemeChange,
  };
}
