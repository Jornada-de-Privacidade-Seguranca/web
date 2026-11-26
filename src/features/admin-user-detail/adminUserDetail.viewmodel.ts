"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
import { useTranslations, useLocale } from "next-intl";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "@/shared/i18n/navigation";
import { useAuth } from "@/hooks/useAuth";
import { usePermission } from "@/hooks/usePermission";
import { ApiRequestError } from "@services/httpClient";
import {
  getUserById,
  updateUser,
  changeUserAccessProfile,
  toggleUserStatus,
  deleteUser,
  getAssignableJourneyProfiles,
  assignJourneyToUser,
  cancelAssignedJourney,
  FORM_FIELD_BY_API_FIELD,
} from "@services/usersService";
import { useAdminUsersStore } from "@features/admin-users/adminUsers.store";
import type {
  ActiveJourneySectionLabels,
  AdminUserDetails,
  AdminUserDetailViewModelReturn,
  AdminUserDetailLabels,
  AssignableJourneyOption,
  AssignJourneyModalLabels,
  CancelAssignmentModalLabels,
  DetailFeedbackMessage,
  EditableUserField,
  JourneyDomain,
  UpdateUserPayload,
  UserFormValues,
  UserFormErrors,
} from "./adminUserDetail.types";

interface UseAdminUserDetailVMProps {
  userId: string;
}

/** Limites do PATCH /users/{user} (UpdateUserRequest). */
const MAX_LENGTH: Record<EditableUserField, number> = {
  name: 50,
  email: 100,
  organization: 100,
  department: 100,
  employeeCode: 50,
};

const EDITABLE_FIELDS: EditableUserField[] = [
  "name",
  "email",
  "organization",
  "department",
  "employeeCode",
];

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const NAME_AND_SURNAME_PATTERN = /^\S+\s+\S+/;

function toFormValues(user: AdminUserDetails): UserFormValues {
  return {
    name: user.name,
    organization: user.organization || "",
    employeeCode: user.employeeCode || "",
    email: user.email,
    department: user.department,
    role: user.role,
  };
}

function apiErrorOf(error: unknown): ApiRequestError | null {
  return error instanceof ApiRequestError ? error : null;
}

const INITIAL_FORM: UserFormValues = {
  name: "",
  organization: "",
  employeeCode: "",
  email: "",
  department: "",
  role: "user",
};

export function useAdminUserDetailVM({
  userId,
}: UseAdminUserDetailVMProps): AdminUserDetailViewModelReturn {
  const t = useTranslations("adminUserDetail");
  const locale = useLocale();
  const apiLocale = locale === "en" ? "en" : "pt";
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user: authUser } = useAuth();
  const { can } = usePermission();
  const listQuery = useAdminUsersStore((s) => s.listQuery);
  const setDeletedUserName = useAdminUsersStore((s) => s.setDeletedUserName);

  // Volta para a listagem com a busca, os filtros e a página de antes
  const backHref = listQuery ? `/admin/usuarios?${listQuery}` : "/admin/usuarios";

  const userQueryKey = useMemo(
    () => ["admin", "user", userId, apiLocale] as const,
    [userId, apiLocale]
  );

  const userQuery = useQuery({
    queryKey: userQueryKey,
    queryFn: () => getUserById(userId, apiLocale),
    retry: false,
  });

  const assignableProfilesQuery = useQuery({
    queryKey: ["admin", "assignable-journey-profiles"],
    queryFn: getAssignableJourneyProfiles,
    retry: false,
  });

  const user = userQuery.data ?? null;
  const isLoading = userQuery.isLoading;
  const isError = userQuery.isError;
  const isNotFound = apiErrorOf(userQuery.error)?.status === 404;
  const errorMessage = userQuery.error
    ? isNotFound
      ? t("notFound.description")
      : t("loadError")
    : null;

  // A própria conta não pode ser desativada, excluída nem ter o perfil alterado
  const isOwnAccount = Boolean(user && authUser && String(authUser.id) === user.id);
  const canManageUser = can("users.manage");
  const canDeleteUser = canManageUser && !isOwnAccount;
  const canManageRoles = can("users.change_profile") && !isOwnAccount;
  // A API so desativa contas com perfil Usuario; ativar e reativar valem para qualquer perfil
  const canToggleStatus =
    can("users.deactivate") &&
    !isOwnAccount &&
    (user?.status !== "active" || user?.role === "user");

  /** Atualiza o detalhe e a listagem depois de salvar, ativar ou excluir. */
  const invalidateUserQueries = useCallback(async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] }),
      queryClient.invalidateQueries({ queryKey: ["admin", "user", userId] }),
    ]);
  }, [queryClient, userId]);

  // Form State
  const [formData, setFormData] = useState<UserFormValues>(INITIAL_FORM);
  const [formErrors, setFormErrors] = useState<UserFormErrors>({});
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveSuccessMessage, setSaveSuccessMessage] = useState<string | null>(
    null
  );
  const [saveErrorMessage, setSaveErrorMessage] = useState<string | null>(null);

  // Status Toggle Loading
  const [isTogglingStatus, setIsTogglingStatus] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<DetailFeedbackMessage | null>(null);

  // Inactive User Banner
  const [isBannerDismissed, setIsBannerDismissed] = useState<boolean>(false);

  // Delete Modal
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [deleteErrorMessage, setDeleteErrorMessage] = useState<string | null>(null);

  // Journey Assignment Modals & Feedback
  const [isAssignModalOpen, setIsAssignModalOpen] = useState<boolean>(false);
  const [selectedProfileId, setSelectedProfileId] = useState<number | null>(
    null
  );
  const [isAssigningJourney, setIsAssigningJourney] = useState<boolean>(false);
  const [assignErrorMessage, setAssignErrorMessage] = useState<string | null>(
    null
  );
  const [isCancelAssignModalOpen, setIsCancelAssignModalOpen] =
    useState<boolean>(false);
  const [isCancellingAssignment, setIsCancellingAssignment] =
    useState<boolean>(false);
  const [cancelErrorMessage, setCancelErrorMessage] = useState<string | null>(
    null
  );
  const [journeySuccessMessage, setJourneySuccessMessage] = useState<
    string | null
  >(null);

  // Synchronize form when user data loads
  useEffect(() => {
    if (user) {
      setFormData(toFormValues(user));
    }
  }, [user]);

  // Compute if form has unsaved modifications
  const isDirty = useMemo(() => {
    if (!user) return false;
    return (
      formData.name !== user.name ||
      formData.organization !== (user.organization || "") ||
      formData.employeeCode !== (user.employeeCode || "") ||
      formData.email !== user.email ||
      formData.department !== user.department ||
      formData.role !== user.role
    );
  }, [formData, user]);

  const handleFieldChange = useCallback(
    (field: keyof UserFormValues, value: string) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
      setSaveSuccessMessage(null);
      setSaveErrorMessage(null);
      // Clear error for edited field
      setFormErrors((prev) => ({ ...prev, [field]: undefined }));
    },
    []
  );

  const handleResetForm = useCallback(() => {
    if (user) {
      setFormData(toFormValues(user));
      setFormErrors({});
      setSaveSuccessMessage(null);
      setSaveErrorMessage(null);
    }
  }, [user]);

  const validateForm = (): boolean => {
    const errors: UserFormErrors = {};
    const name = formData.name.trim();
    const email = formData.email.trim();

    if (!name) {
      errors.name = t("editForm.validation.nameRequired");
    } else if (!NAME_AND_SURNAME_PATTERN.test(name)) {
      errors.name = t("editForm.validation.nameSurname");
    }
    if (!email) {
      errors.email = t("editForm.validation.emailRequired");
    } else if (!EMAIL_PATTERN.test(email)) {
      errors.email = t("editForm.validation.emailInvalid");
    }
    // A API não aceita apagar o órgão: só é obrigatório se já estava preenchido
    if (!formData.organization.trim() && user?.organization) {
      errors.organization = t("editForm.validation.organizationRequired");
    }
    if (!formData.department.trim()) {
      errors.department = t("editForm.validation.departmentRequired");
    }
    if (!formData.employeeCode.trim()) {
      errors.employeeCode = t("editForm.validation.employeeCodeRequired");
    }

    EDITABLE_FIELDS.forEach((field) => {
      if (!errors[field] && formData[field].trim().length > MAX_LENGTH[field]) {
        errors[field] = t("editForm.validation.maxLength", { max: MAX_LENGTH[field] });
      }
    });

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  /** Erros da API no salvar: por campo quando possível, senão no aviso do formulário. */
  const applySaveError = (error: unknown) => {
    const apiError = apiErrorOf(error);
    const fieldErrors: UserFormErrors = {};
    let generalMessage: string | null = null;

    if (apiError?.code === "EMAIL_ALREADY_IN_USE") {
      fieldErrors.email = t("errors.emailInUse");
    } else if (apiError?.code === "SELF_PROFILE_CHANGE_FORBIDDEN") {
      fieldErrors.role = t("errors.selfProfileChange");
    } else if (apiError?.code === "LAST_ADMIN_REQUIRED") {
      fieldErrors.role = t("errors.lastAdmin");
    } else if (apiError?.code === "PERMISSION_DENIED") {
      generalMessage = t("errors.permissionDenied");
    } else if (apiError?.status === 404) {
      generalMessage = t("errors.notFound");
    } else if (apiError?.status === 422 && apiError.errors) {
      Object.entries(apiError.errors).forEach(([apiField, messages]) => {
        const formField =
          apiField === "profile_type_id" ? "role" : FORM_FIELD_BY_API_FIELD[apiField];
        if (formField) {
          fieldErrors[formField] = messages[0];
        } else {
          generalMessage = t("errors.validation");
        }
      });
      generalMessage = generalMessage ?? t("errors.validation");
    } else {
      generalMessage = t("errors.saveFailed");
    }

    setFormErrors((prev) => ({ ...prev, ...fieldErrors }));
    setSaveErrorMessage(generalMessage);
  };

  const handleSaveForm = async (): Promise<void> => {
    if (!user || !validateForm()) return;

    const changes: UpdateUserPayload = {};
    EDITABLE_FIELDS.forEach((field) => {
      const original = (user[field] ?? "").trim();
      const current = formData[field].trim();
      if (current !== original) changes[field] = current;
    });
    const roleChanged = canManageRoles && formData.role !== user.role;

    if (Object.keys(changes).length === 0 && !roleChanged) return;

    setIsSaving(true);
    setSaveErrorMessage(null);
    setSaveSuccessMessage(null);
    setStatusMessage(null);
    let savedSomething = false;
    try {
      if (Object.keys(changes).length > 0) {
        await updateUser(user.id, changes);
        savedSomething = true;
      }
      if (roleChanged) {
        await changeUserAccessProfile(user.id, formData.role);
        savedSomething = true;
      }
      setSaveSuccessMessage(t("editForm.saveSuccess"));
    } catch (error) {
      applySaveError(error);
    } finally {
      // Se algo foi gravado (mesmo com erro depois), a tela volta a refletir o servidor
      if (savedSomething) {
        await invalidateUserQueries();
      }
      setIsSaving(false);
    }
  };

  const statusErrorMessage = (error: unknown): string => {
    const apiError = apiErrorOf(error);
    switch (apiError?.code) {
      case "SELF_DEACTIVATION_FORBIDDEN":
        return t("errors.selfDeactivation");
      case "LAST_ADMIN_REQUIRED":
        return t("errors.lastAdmin");
      case "INVALID_USER_ACCOUNT_STATE":
        return t("errors.invalidAccountState");
      case "PERMISSION_DENIED":
        return t("errors.permissionDenied");
      default:
        return apiError?.status === 404 ? t("errors.notFound") : t("errors.statusFailed");
    }
  };

  // Ativar (pendente ou inativa) ou desativar (ativa) a conta: o aviso de inativo usa o mesmo fluxo
  const handleToggleStatus = async (): Promise<void> => {
    if (!user || isTogglingStatus) return;
    setIsTogglingStatus(true);
    setStatusMessage(null);
    const targetStatus = user.status === "active" ? "inactive" : "active";
    try {
      await toggleUserStatus(user.id, targetStatus);
      setStatusMessage({
        variant: "success",
        text:
          targetStatus === "active"
            ? t("status.activateSuccess")
            : t("status.deactivateSuccess"),
      });
      await invalidateUserQueries();
    } catch (error) {
      setStatusMessage({ variant: "destructive", text: statusErrorMessage(error) });
    } finally {
      setIsTogglingStatus(false);
    }
  };

  const handleDismissStatusMessage = useCallback(() => {
    setStatusMessage(null);
  }, []);

  // Banner logic
  const storageKey = `admin_dont_show_inactive_banner_${userId}`;
  const [isPermanentlyDismissed, setIsPermanentlyDismissed] =
    useState<boolean>(false);

  useEffect(() => {
    try {
      if (typeof window !== "undefined") {
        const stored = window.localStorage.getItem(storageKey);
        if (stored === "true") {
          setIsPermanentlyDismissed(true);
        }
      }
    } catch {
      // Ignora erro de acesso ao localStorage (ex: modo restrito)
    }
  }, [storageKey]);

  const showInactiveBanner =
    canToggleStatus &&
    user?.status === "inactive" &&
    !isBannerDismissed &&
    !isPermanentlyDismissed;

  const handleDismissBanner = useCallback(() => {
    setIsBannerDismissed(true);
  }, []);

  const handleDontShowAgain = useCallback(() => {
    try {
      if (typeof window !== "undefined") {
        window.localStorage.setItem(storageKey, "true");
      }
    } catch {
      // Ignora erro ao salvar no localStorage
    }
    setIsPermanentlyDismissed(true);
    setIsBannerDismissed(true);
  }, [storageKey]);

  // Delete modal
  const handleOpenDeleteModal = useCallback(() => {
    setDeleteErrorMessage(null);
    setIsDeleteModalOpen(true);
  }, []);

  const handleCloseDeleteModal = useCallback(() => {
    if (isDeleting) return;
    setIsDeleteModalOpen(false);
    setDeleteErrorMessage(null);
  }, [isDeleting]);

  const deleteErrorText = (error: unknown): string => {
    const apiError = apiErrorOf(error);
    switch (apiError?.code) {
      case "SELF_DELETION_FORBIDDEN":
        return t("errors.selfDeletion");
      case "LAST_ADMIN_REQUIRED":
        return t("errors.lastAdmin");
      case "PERMISSION_DENIED":
        return t("errors.permissionDenied");
      default:
        return apiError?.status === 404 ? t("errors.notFound") : t("errors.deleteFailed");
    }
  };

  const handleConfirmDelete = async (): Promise<void> => {
    if (!user) return;
    setIsDeleting(true);
    setDeleteErrorMessage(null);
    try {
      await deleteUser(user.id);
      setDeletedUserName(user.name?.trim() || user.email);
      setIsDeleteModalOpen(false);
      queryClient.removeQueries({ queryKey: ["admin", "user", userId] });
      await queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
      router.push(backHref);
    } catch (error) {
      setDeleteErrorMessage(deleteErrorText(error));
    } finally {
      setIsDeleting(false);
    }
  };

  const handleRetry = useCallback(() => {
    void userQuery.refetch();
  }, [userQuery]);

  const activeJourney = user?.activeJourney ?? null;
  const isFirstJourney = (user?.journeys.length ?? 0) === 0;
  const initialJourneyProfileId = user?.initialJourneyProfileId;
  // Sem jornada e sem o perfil inicial escolhido, o usuário precisa escolher antes da primeira
  const isInitialProfileRequired = isFirstJourney && !initialJourneyProfileId;
  const isEnglish = locale === "en";

  const domainLabels: Record<JourneyDomain, string> = useMemo(
    () => ({
      privacy: t("assignJourney.domains.privacy"),
      security: t("assignJourney.domains.security"),
      joint: t("assignJourney.domains.joint"),
    }),
    [t]
  );

  const assignableOptions: AssignableJourneyOption[] = useMemo(() => {
    const mapped: AssignableJourneyOption[] = (
      assignableProfilesQuery.data ?? []
    ).map((profile) => ({
      id: profile.id,
      name: isEnglish ? profile.nameEn : profile.namePt,
      domain: profile.domain,
      domainLabel: domainLabels[profile.domain],
    }));

    if (!isFirstJourney || mapped.length === 0) {
      return mapped;
    }

    if (!initialJourneyProfileId) {
      return [];
    }

    const chosenOption = mapped.find(
      (opt) => opt.id === initialJourneyProfileId
    );
    return chosenOption ? [chosenOption] : [];
  }, [
    assignableProfilesQuery.data,
    domainLabels,
    isEnglish,
    isFirstJourney,
    initialJourneyProfileId,
  ]);

  const handleOpenAssignModal = useCallback(() => {
    if (activeJourney) return;
    setJourneySuccessMessage(null);
    setAssignErrorMessage(null);
    setSelectedProfileId(assignableOptions[0]?.id ?? null);
    setIsAssignModalOpen(true);
  }, [activeJourney, assignableOptions]);

  const handleCloseAssignModal = useCallback(() => {
    if (!isAssigningJourney) {
      setIsAssignModalOpen(false);
      setAssignErrorMessage(null);
    }
  }, [isAssigningJourney]);

  const handleSelectProfile = useCallback((profileId: number) => {
    setSelectedProfileId(profileId);
    setAssignErrorMessage(null);
  }, []);

  /** Recarrega o detalhe (com a jornada em andamento) e a listagem de usuários. */
  const refreshUserAfterJourneyChange = useCallback(async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["admin", "user", userId] }),
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] }),
    ]);
  }, [queryClient, userId]);

  /**
   * Mensagem do erro ao atribuir. Os erros que indicam uma tela desatualizada
   * (já há jornada em andamento ou o perfil inicial mudou) também recarregam o usuário.
   */
  const assignErrorText = (error: unknown): { message: string; shouldRefresh: boolean } => {
    const apiError = apiErrorOf(error);
    if (apiError?.status === 409) {
      return { message: t("activeJourney.alreadyActiveHint"), shouldRefresh: true };
    }
    if (apiError?.code === "JOURNEY_PROFILE_SELECTION_REQUIRED") {
      return { message: t("assignJourney.selectionRequiredNotice"), shouldRefresh: true };
    }
    if (apiError?.code === "JOURNEY_PROFILE_MISMATCH") {
      return { message: t("assignJourney.firstJourneyNotice"), shouldRefresh: true };
    }
    return { message: t("assignJourney.error"), shouldRefresh: false };
  };

  const handleConfirmAssignJourney = async (): Promise<void> => {
    if (!user || selectedProfileId === null || activeJourney) return;
    setIsAssigningJourney(true);
    setAssignErrorMessage(null);
    try {
      await assignJourneyToUser(user.id, { profileId: selectedProfileId });
      setIsAssignModalOpen(false);
      setJourneySuccessMessage(t("assignJourney.success"));
      await refreshUserAfterJourneyChange();
    } catch (error) {
      // Erro de rede ou 5xx mantém o modal aberto para tentar de novo
      const { message, shouldRefresh } = assignErrorText(error);
      setAssignErrorMessage(message);
      if (shouldRefresh) await refreshUserAfterJourneyChange();
    } finally {
      setIsAssigningJourney(false);
    }
  };

  const handleOpenCancelAssignModal = useCallback(() => {
    setCancelErrorMessage(null);
    setIsCancelAssignModalOpen(true);
  }, []);

  const handleCloseCancelAssignModal = useCallback(() => {
    if (!isCancellingAssignment) {
      setIsCancelAssignModalOpen(false);
      setCancelErrorMessage(null);
    }
  }, [isCancellingAssignment]);

  /** 403 e 409 indicam que a jornada mudou desde que a tela foi carregada. */
  const cancelErrorText = (error: unknown): { message: string; shouldRefresh: boolean } => {
    const status = apiErrorOf(error)?.status;
    if (status === 403) {
      return { message: t("activeJourney.cancelForbidden"), shouldRefresh: true };
    }
    if (status === 409 || status === 404) {
      return { message: t("activeJourney.cancelNotAllowed"), shouldRefresh: true };
    }
    return { message: t("activeJourney.cancelError"), shouldRefresh: false };
  };

  const handleConfirmCancelAssignment = async (): Promise<void> => {
    if (!user || !activeJourney) return;
    setIsCancellingAssignment(true);
    setCancelErrorMessage(null);
    try {
      await cancelAssignedJourney(activeJourney.id);
      setIsCancelAssignModalOpen(false);
      setJourneySuccessMessage(t("activeJourney.cancelSuccess"));
      await refreshUserAfterJourneyChange();
    } catch (error) {
      const { message, shouldRefresh } = cancelErrorText(error);
      setCancelErrorMessage(message);
      if (shouldRefresh) await refreshUserAfterJourneyChange();
    } finally {
      setIsCancellingAssignment(false);
    }
  };

  const handleDismissJourneyMessage = useCallback(() => {
    setJourneySuccessMessage(null);
  }, []);

  const labels: AdminUserDetailLabels = {
    backToList: t("backToList"),
    statusActive: t("status.active"),
    statusPending: t("status.pending"),
    statusInactive: t("status.inactive"),
    statusActivate: t("status.activate"),
    statusDeactivate: t("status.deactivate"),
    accountActive: t("status.accountActive"),
    accountInactive: t("status.accountInactive"),
    accountPending: t("status.accountPending"),
    toggleSuccess: t("status.toggleSuccess"),
    bannerTitle: t("inactiveBanner.title"),
    bannerDescription: t("inactiveBanner.description"),
    bannerActivateNow: t("inactiveBanner.activateNow"),
    bannerDismiss: t("inactiveBanner.dismiss"),
    bannerDontShowAgain: t("inactiveBanner.dontShowAgain"),
    formTitle: t("editForm.title"),
    formSubtitle: t("editForm.subtitle"),
    formName: t("editForm.name"),
    formOrganization: t("editForm.organization"),
    formEmployeeCode: t("editForm.employeeCode"),
    formEmail: t("editForm.email"),
    formDepartment: t("editForm.department"),
    formRole: t("editForm.role"),
    formRoleAdmin: t("editForm.roleAdmin"),
    formRoleManager: t("editForm.roleManager"),
    formRoleUser: t("editForm.roleUser"),
    formUnsavedChanges: t("editForm.unsavedChanges"),
    formCancel: t("editForm.cancel"),
    formSave: t("editForm.save"),
    formSaving: t("editForm.saving"),
    formSaveSuccess: t("editForm.saveSuccess"),
    valNameRequired: t("editForm.validation.nameRequired"),
    valNameSurname: t("editForm.validation.nameSurname"),
    valOrganizationRequired: t("editForm.validation.organizationRequired"),
    valMaxLength: (max: number) => t("editForm.validation.maxLength", { max }),
    valEmailRequired: t("editForm.validation.emailRequired"),
    valEmailInvalid: t("editForm.validation.emailInvalid"),
    valDepartmentRequired: t("editForm.validation.departmentRequired"),
    valEmployeeCodeRequired: t("editForm.validation.employeeCodeRequired"),
    journeysTitle: t("journeys.title"),
    journeysSubtitle: t("journeys.subtitle"),
    journeysViewResult: t("journeys.viewResult"),
    journeysViewAllResults: t("journeys.viewAllResults"),
    journeysScore: (score: number) => t("journeys.score", { score }),
    journeysCompletedAt: (date: string) => t("journeys.completedAt", { date }),
    journeysEmptyTitle: t("journeys.emptyTitle"),
    journeysEmptyDescription: t("journeys.emptyDescription"),
    dangerZoneTitle: t("dangerZone.title"),
    dangerZoneDescription: t("dangerZone.description"),
    dangerZoneDeleteButton: t("dangerZone.deleteButton"),
    modalTitle: t("dangerZone.modalTitle"),
    modalDescription: (name: string) =>
      t("dangerZone.modalDescription", { name }),
    modalCancel: t("dangerZone.modalCancel"),
    modalConfirm: t("dangerZone.modalConfirm"),
    deleteSuccess: t("dangerZone.deleteSuccess"),
    deleting: t("dangerZone.deleting"),
    loadErrorMessage: t("loadError"),
    retryButton: t("retry"),
    notFoundTitle: t("notFound.title"),
    notFoundDescription: t("notFound.description"),
    closeMessage: t("closeMessage"),
  };

  const activeJourneyLabels: ActiveJourneySectionLabels = {
    title: t("activeJourney.title"),
    subtitle: t("activeJourney.subtitle"),
    emptyTitle: t("activeJourney.emptyTitle"),
    emptyDescription: t("activeJourney.emptyDescription"),
    startedAt: (date: string) => t("activeJourney.startedAt", { date }),
    originSelf: t("activeJourney.originSelf"),
    originAssigned: (name: string) =>
      t("activeJourney.originAssigned", { name }),
    assignButton: t("activeJourney.assignButton"),
    alreadyActiveHint: t("activeJourney.alreadyActiveHint"),
    cancelButton: t("activeJourney.cancelButton"),
    closeMessage: t("activeJourney.closeMessage"),
    domains: domainLabels,
  };

  const assignJourneyLabels: AssignJourneyModalLabels = {
    modalTitle: t("assignJourney.modalTitle"),
    modalDescription: t("assignJourney.modalDescription"),
    firstJourneyNotice: t("assignJourney.firstJourneyNotice"),
    selectionRequiredNotice: t("assignJourney.selectionRequiredNotice"),
    cancel: t("assignJourney.cancel"),
    confirm: t("assignJourney.confirm"),
    submitting: t("assignJourney.submitting"),
    emptyOptions: t("assignJourney.emptyOptions"),
  };

  const cancelAssignmentLabels: CancelAssignmentModalLabels = {
    modalTitle: t("activeJourney.cancelModalTitle"),
    modalDescription: (title: string) =>
      t("activeJourney.cancelModalDescription", { title }),
    keepButton: t("activeJourney.cancelModalKeep"),
    confirmButton: t("activeJourney.cancelModalConfirm"),
    cancellingButton: t("activeJourney.cancellingButton"),
  };


  const canAssignJourney = can("journeys.assign");
  const activeJourneyAssignedBy =
    activeJourney?.assignedBy ?? activeJourney?.assigned_by ?? null;
  const canCancelAssignment = Boolean(
    activeJourney &&
      activeJourney.origin === "assigned" &&
      activeJourneyAssignedBy &&
      authUser &&
      String(activeJourneyAssignedBy.id) === String(authUser.id)
  );

  return {
    user,
    isLoading,
    isError,
    isNotFound,
    errorMessage,
    handleRetry,
    backHref,

    isTogglingStatus,
    handleToggleStatus,
    statusMessage,
    handleDismissStatusMessage,

    showInactiveBanner,
    handleDismissBanner,
    handleDontShowAgain,

    formData,
    formErrors,
    isDirty,
    isSaving,
    saveSuccessMessage,
    saveErrorMessage,
    handleFieldChange,
    handleResetForm,
    handleSaveForm,

    activeJourney,
    assignableOptions,
    isFirstJourney,
    isInitialProfileRequired,
    selectedProfileId,
    isAssignModalOpen,
    isAssigningJourney,
    assignErrorMessage,
    isCancelAssignModalOpen,
    isCancellingAssignment,
    cancelErrorMessage,
    journeySuccessMessage,
    canAssignJourney,
    canCancelAssignment,
    handleOpenAssignModal,
    handleCloseAssignModal,
    handleSelectProfile,
    handleConfirmAssignJourney,
    handleOpenCancelAssignModal,
    handleCloseCancelAssignModal,
    handleConfirmCancelAssignment,
    handleDismissJourneyMessage,
    activeJourneyLabels,
    assignJourneyLabels,
    cancelAssignmentLabels,

    journeys: user?.journeys ?? [],

    isDeleteModalOpen,
    isDeleting,
    deleteErrorMessage,
    handleOpenDeleteModal,
    handleCloseDeleteModal,
    handleConfirmDelete,

    canDeleteUser,
    canManageRoles,
    canManageUser,
    canToggleStatus,

    labels,
  };
}
