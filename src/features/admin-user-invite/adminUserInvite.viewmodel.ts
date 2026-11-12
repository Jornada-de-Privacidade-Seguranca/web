"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { useRouter } from "@/shared/i18n/navigation";
import { usePermission } from "@/hooks/usePermission";
import { ApiRequestError } from "@services/httpClient";
import { inviteUser } from "@services/usersService";
import type { UserRole } from "@features/admin-users/adminUsers.types";
import type {
  AdminUserInviteLabels,
  AdminUserInviteViewModelReturn,
  InviteRoleOption,
  InviteUserPayload,
} from "./adminUserInvite.types";

/**
 * ViewModel da tela de convite de novo usuário por e-mail (/admin/usuarios/novo).
 * Gerencia validações de e-mail, trava do perfil sem `users.change_profile` e estados de envio.
 */
export function useAdminUserInviteVM(): AdminUserInviteViewModelReturn {
  const t = useTranslations("adminUserInvite");
  const router = useRouter();
  const queryClient = useQueryClient();
  const { can } = usePermission();

  const canChangeProfile = can("users.change_profile");

  const [email, setEmail] = useState("");
  const [selectedRole, setSelectedRole] = useState<UserRole>("user");
  const [emailError, setEmailError] = useState<string | null>(null);
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
    errors: {
      emailRequired: t("errors.emailRequired"),
      emailInvalid: t("errors.emailInvalid"),
      accountAlreadyExists: t("errors.accountAlreadyExists"),
      genericSubmit: t("errors.genericSubmit"),
    },
  };

  const roleOptions: InviteRoleOption[] = useMemo(
    () => [
      { value: "user", label: t("roles.user") },
      { value: "manager", label: t("roles.manager") },
      { value: "admin", label: t("roles.admin") },
    ],
    [t],
  );

  // Sem permissão users.change_profile o perfil fica travado em Usuário ("user")
  const role: UserRole = canChangeProfile ? selectedRole : "user";

  const emailSchema = useMemo(
    () =>
      z
        .string()
        .trim()
        .min(1, labels.errors.emailRequired)
        .email(labels.errors.emailInvalid),
    [labels.errors.emailInvalid, labels.errors.emailRequired],
  );

  const inviteMutation = useMutation({
    mutationFn: (payload: InviteUserPayload) => inviteUser(payload),
  });

  const handleEmailChange = (value: string) => {
    setEmail(value);
    if (emailError) {
      setEmailError(null);
    }
    if (submitError) {
      setSubmitError(null);
    }
  };

  const handleRoleChange = (nextRole: UserRole) => {
    if (!canChangeProfile) {
      return;
    }
    setSelectedRole(nextRole);
    if (submitError) {
      setSubmitError(null);
    }
  };

  const handleCancel = () => {
    router.push("/admin/usuarios");
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
    setSubmitError(null);

    try {
      const response = await inviteMutation.mutateAsync({
        email: parsed.data,
        role,
      });

      await queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
      router.push(
        `/admin/usuarios?invited=${encodeURIComponent(response.email)}`,
      );
    } catch (error: unknown) {
      const isAlreadyExistsError =
        error instanceof ApiRequestError &&
        (error.status === 409 || error.code === "ACCOUNT_ALREADY_EXISTS");

      if (isAlreadyExistsError) {
        setEmailError(labels.errors.accountAlreadyExists);
        return;
      }

      setSubmitError(labels.errors.genericSubmit);
    }
  };

  const summaryTitle = email.trim() || labels.summaryEmptyTitle;
  const summaryRoleLabel =
    roleOptions.find((opt) => opt.value === role)?.label ?? t("roles.user");

  return {
    email,
    role,
    summaryTitle,
    summaryRoleLabel,
    roleOptions,
    canChangeProfile,
    emailError,
    submitError,
    isSubmitting: inviteMutation.isPending,
    labels,
    handleEmailChange,
    handleRoleChange,
    handleCancel,
    handleSubmit,
  };
}
