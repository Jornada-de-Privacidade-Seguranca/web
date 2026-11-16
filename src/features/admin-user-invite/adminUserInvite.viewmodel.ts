"use client";

import { useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { useRouter } from "@/shared/i18n/navigation";
import { usePermission } from "@/hooks/usePermission";
import { ApiRequestError } from "@services/httpClient";
import {
  getAccessProfiles,
  inviteUser,
  PROFILE_ID_BY_ROLE,
} from "@services/usersService";
import { useAdminUsersStore } from "@features/admin-users/adminUsers.store";
import type {
  AdminUserInviteLabels,
  AdminUserInviteViewModelReturn,
  InviteRoleOption,
  InviteUserPayload,
} from "./adminUserInvite.types";

/** Perfil padrão do convite (e o único sem `users.change_profile`). */
const DEFAULT_PROFILE_ID = PROFILE_ID_BY_ROLE.user;

/**
 * ViewModel da tela de convite de novo usuário por e-mail (/admin/usuarios/novo).
 * Os perfis vêm de GET /access-profiles, a mesma fonte da gestão de usuários, e
 * o convite vai para POST /admin/user-invitations.
 */
export function useAdminUserInviteVM(): AdminUserInviteViewModelReturn {
  const t = useTranslations("adminUserInvite");
  const locale = useLocale() === "en" ? "en" : "pt";
  const router = useRouter();
  const queryClient = useQueryClient();
  const { can } = usePermission();
  const listQuery = useAdminUsersStore((s) => s.listQuery);

  const canChangeProfile = can("users.change_profile");
  const backHref = listQuery ? `/admin/usuarios?${listQuery}` : "/admin/usuarios";

  const [email, setEmail] = useState("");
  const [selectedProfileId, setSelectedProfileId] = useState<number>(DEFAULT_PROFILE_ID);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [roleError, setRoleError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const labels: AdminUserInviteLabels = {
    pageTitle: t("pageTitle"),
    pageSubtitle: t("pageSubtitle"),
    backToList: t("backToList"),
    summaryEmptyTitle: t("summary.emptyTitle"),
    summaryBadge: t("summary.badge"),
    formTitle: t("form.title"),
    formSubtitle: t("form.subtitle"),
    emailLabel: t("form.emailLabel"),
    emailPlaceholder: t("form.emailPlaceholder"),
    roleLabel: t("form.roleLabel"),
    roleLockedHint: t("form.roleLockedHint"),
    infoNotice: t("form.infoNotice"),
    cancelButton: t("form.cancel"),
    submitButton: t("form.submit"),
    submittingButton: t("form.submitting"),
    profilesLoadError: t("form.profilesLoadError"),
    retryButton: t("form.retry"),
    errors: {
      emailRequired: t("errors.emailRequired"),
      emailInvalid: t("errors.emailInvalid"),
      accountAlreadyExists: t("errors.accountAlreadyExists"),
      genericSubmit: t("errors.genericSubmit"),
      permissionDenied: t("errors.permissionDenied"),
      tooManyAttempts: t("errors.tooManyAttempts"),
      validation: t("errors.validation"),
    },
  };

  const profilesQuery = useQuery({
    queryKey: ["admin", "access-profiles", locale],
    queryFn: () => getAccessProfiles(locale),
    retry: false,
  });

  // O perfil padrão vem primeiro; sem a lista (carregando ou com erro) fica só ele
  const roleOptions: InviteRoleOption[] = useMemo(() => {
    const profiles = profilesQuery.data ?? [];
    const options = profiles
      .map((profile) => ({ value: profile.id, label: profile.name }))
      .sort((a, b) => Number(b.value === DEFAULT_PROFILE_ID) - Number(a.value === DEFAULT_PROFILE_ID));
    const defaultOption = options.find((option) => option.value === DEFAULT_PROFILE_ID) ?? {
      value: DEFAULT_PROFILE_ID,
      label: t("roles.user"),
    };
    if (!canChangeProfile || options.length === 0) return [defaultOption];
    return options;
  }, [profilesQuery.data, canChangeProfile, t]);

  // Sem permissão users.change_profile o perfil fica travado em Usuário
  const profileTypeId = canChangeProfile ? selectedProfileId : DEFAULT_PROFILE_ID;

  const emailSchema = useMemo(
    () =>
      z
        .string()
        .trim()
        .min(1, labels.errors.emailRequired)
        .max(100, labels.errors.emailInvalid)
        .email(labels.errors.emailInvalid),
    [labels.errors.emailInvalid, labels.errors.emailRequired],
  );

  const inviteMutation = useMutation({
    mutationFn: (payload: InviteUserPayload) => inviteUser(payload),
  });

  const handleEmailChange = (value: string) => {
    setEmail(value);
    setEmailError(null);
    setSubmitError(null);
  };

  const handleRoleChange = (nextProfileId: number) => {
    if (!canChangeProfile) {
      return;
    }
    setSelectedProfileId(nextProfileId);
    setRoleError(null);
    setSubmitError(null);
  };

  const handleRetryProfiles = () => {
    void profilesQuery.refetch();
  };

  const handleCancel = () => {
    router.push(backHref);
  };

  const applySubmitError = (error: unknown) => {
    if (!(error instanceof ApiRequestError)) {
      setSubmitError(labels.errors.genericSubmit);
      return;
    }

    if (error.status === 409 || error.code === "ACCOUNT_ALREADY_EXISTS") {
      setEmailError(labels.errors.accountAlreadyExists);
      return;
    }
    if (error.status === 403 || error.code === "PERMISSION_DENIED") {
      setSubmitError(labels.errors.permissionDenied);
      return;
    }
    if (error.status === 429) {
      setSubmitError(labels.errors.tooManyAttempts);
      return;
    }
    if (error.status === 422 && error.errors) {
      const { email: emailMessages, profile_type_id: profileMessages, ...others } = error.errors;
      if (emailMessages?.[0]) setEmailError(emailMessages[0]);
      if (profileMessages?.[0]) setRoleError(profileMessages[0]);
      const otherMessages = Object.values(others).flat();
      if (otherMessages.length > 0 || (!emailMessages && !profileMessages)) {
        setSubmitError(labels.errors.validation);
      }
      return;
    }

    setSubmitError(labels.errors.genericSubmit);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (inviteMutation.isPending) {
      return;
    }

    const parsed = emailSchema.safeParse(email);
    if (!parsed.success) {
      setEmailError(
        parsed.error.issues[0]?.message ?? labels.errors.emailInvalid,
      );
      return;
    }

    setEmailError(null);
    setRoleError(null);
    setSubmitError(null);

    try {
      const response = await inviteMutation.mutateAsync({
        email: parsed.data,
        profileTypeId,
      });

      useAdminUsersStore.getState().setInvitedEmail(response.email);
      await queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
      router.push(backHref);
    } catch (error: unknown) {
      applySubmitError(error);
    }
  };

  const summaryTitle = email.trim() || labels.summaryEmptyTitle;
  const summaryRoleLabel =
    roleOptions.find((opt) => opt.value === profileTypeId)?.label ?? t("roles.user");

  return {
    email,
    profileTypeId,
    summaryTitle,
    summaryRoleLabel,
    roleOptions,
    canChangeProfile,
    isProfilesLoading: profilesQuery.isLoading,
    isProfilesError: canChangeProfile && profilesQuery.isError,
    emailError,
    roleError,
    submitError,
    isSubmitting: inviteMutation.isPending,
    backHref,
    labels,
    handleEmailChange,
    handleRoleChange,
    handleRetryProfiles,
    handleCancel,
    handleSubmit,
  };
}
