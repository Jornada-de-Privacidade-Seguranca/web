"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "@/shared/i18n/navigation";
import { useAuth } from "@/hooks/useAuth";
import { usePermission } from "@/hooks/usePermission";
import {
  getUserById,
  updateUser,
  toggleUserStatus,
  deleteUser,
  getAssignableJourneyProfiles,
  assignJourneyToUser,
  cancelAssignedJourney,
} from "@services/usersService";
import type {
  ActiveJourneySectionLabels,
  AdminUserDetailViewModelReturn,
  AdminUserDetailLabels,
  AssignableJourneyOption,
  AssignJourneyModalLabels,
  CancelAssignmentModalLabels,
  JourneyDomain,
  UserFormValues,
  UserFormErrors,
} from "./adminUserDetail.types";

interface UseAdminUserDetailVMProps {
  userId: string;
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
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user: authUser } = useAuth();
  const { can } = usePermission();

  const userQuery = useQuery({
    queryKey: ["admin", "user", userId],
    queryFn: () => getUserById(userId),
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
  const errorMessage = userQuery.error ? t("editForm.save") : null;

  // Form State
  const [formData, setFormData] = useState<UserFormValues>(INITIAL_FORM);
  const [formErrors, setFormErrors] = useState<UserFormErrors>({});
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveSuccessMessage, setSaveSuccessMessage] = useState<string | null>(
    null
  );

  // Status Toggle Loading
  const [isTogglingStatus, setIsTogglingStatus] = useState<boolean>(false);

  // Inactive User Banner
  const [isBannerDismissed, setIsBannerDismissed] = useState<boolean>(false);

  // Delete Modal
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  // Journey Assignment Modals & Feedback
  const [isAssignModalOpen, setIsAssignModalOpen] = useState<boolean>(false);
  const [selectedProfileId, setSelectedProfileId] = useState<number | null>(
    null
  );
  const [isAssigningJourney, setIsAssigningJourney] = useState<boolean>(false);
  const [isCancelAssignModalOpen, setIsCancelAssignModalOpen] =
    useState<boolean>(false);
  const [isCancellingAssignment, setIsCancellingAssignment] =
    useState<boolean>(false);
  const [journeySuccessMessage, setJourneySuccessMessage] = useState<
    string | null
  >(null);

  // Synchronize form when user data loads
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name,
        organization: user.organization || "",
        employeeCode: user.employeeCode || "",
        email: user.email,
        department: user.department,
        role: user.role,
      });
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
      // Clear error for edited field
      setFormErrors((prev) => ({ ...prev, [field]: undefined }));
    },
    []
  );

  const handleResetForm = useCallback(() => {
    if (user) {
      setFormData({
        name: user.name,
        organization: user.organization || "",
        employeeCode: user.employeeCode || "",
        email: user.email,
        department: user.department,
        role: user.role,
      });
      setFormErrors({});
      setSaveSuccessMessage(null);
    }
  }, [user]);

  const validateForm = (): boolean => {
    const errors: UserFormErrors = {};
    if (!formData.name.trim()) {
      errors.name = t("editForm.validation.nameRequired");
    }
    if (!formData.email.trim()) {
      errors.email = t("editForm.validation.emailRequired");
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      errors.email = t("editForm.validation.emailInvalid");
    }
    if (!formData.department.trim()) {
      errors.department = t("editForm.validation.departmentRequired");
    }
    if (!formData.employeeCode.trim()) {
      errors.employeeCode = t("editForm.validation.employeeCodeRequired");
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSaveForm = async (): Promise<void> => {
    if (!validateForm() || !user) return;
    setIsSaving(true);
    try {
      const updated = await updateUser(user.id, formData);
      queryClient.setQueryData(["admin", "user", userId], updated);
      setSaveSuccessMessage(t("editForm.saveSuccess"));
      setTimeout(() => setSaveSuccessMessage(null), 4000);
    } finally {
      setIsSaving(false);
    }
  };

  // Toggle user activation
  const handleToggleStatus = async (): Promise<void> => {
    if (!user) return;
    setIsTogglingStatus(true);
    try {
      const targetStatus = user.status === "active" ? "inactive" : "active";
      const updated = await toggleUserStatus(user.id, targetStatus);
      queryClient.setQueryData(["admin", "user", userId], updated);
    } finally {
      setIsTogglingStatus(false);
    }
  };

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
    setIsDeleteModalOpen(true);
  }, []);

  const handleCloseDeleteModal = useCallback(() => {
    setIsDeleteModalOpen(false);
  }, []);

  const handleConfirmDelete = async (): Promise<void> => {
    if (!user) return;
    setIsDeleting(true);
    try {
      await deleteUser(user.id);
      setIsDeleteModalOpen(false);
      router.push("/admin/usuarios");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleRetry = useCallback(() => {
    void userQuery.refetch();
  }, [userQuery]);

  const activeJourney = user?.activeJourney ?? null;
  const isFirstJourney = (user?.journeys.length ?? 0) === 0;
  const isEnglish = params?.locale === "en";

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

    const chosenId = user?.initialJourneyProfileId ?? mapped[0].id;
    const chosenOption = mapped.find((opt) => opt.id === chosenId) ?? mapped[0];
    return [chosenOption];
  }, [
    assignableProfilesQuery.data,
    domainLabels,
    isEnglish,
    isFirstJourney,
    user?.initialJourneyProfileId,
  ]);

  const handleOpenAssignModal = useCallback(() => {
    if (activeJourney) return;
    setJourneySuccessMessage(null);
    setSelectedProfileId(assignableOptions[0]?.id ?? null);
    setIsAssignModalOpen(true);
  }, [activeJourney, assignableOptions]);

  const handleCloseAssignModal = useCallback(() => {
    if (!isAssigningJourney) {
      setIsAssignModalOpen(false);
    }
  }, [isAssigningJourney]);

  const handleSelectProfile = useCallback((profileId: number) => {
    setSelectedProfileId(profileId);
  }, []);

  const handleConfirmAssignJourney = async (): Promise<void> => {
    if (!user || selectedProfileId === null || activeJourney) return;
    setIsAssigningJourney(true);
    try {
      const assignedBy = {
        id: authUser?.id ?? 1,
        name: authUser?.name ?? "",
      };
      const updated = await assignJourneyToUser(user.id, {
        profileId: selectedProfileId,
        assignedBy,
      });
      queryClient.setQueryData(["admin", "user", userId], updated);
      setIsAssignModalOpen(false);
      setJourneySuccessMessage(t("assignJourney.success"));
    } finally {
      setIsAssigningJourney(false);
    }
  };

  const handleOpenCancelAssignModal = useCallback(() => {
    setIsCancelAssignModalOpen(true);
  }, []);

  const handleCloseCancelAssignModal = useCallback(() => {
    if (!isCancellingAssignment) {
      setIsCancelAssignModalOpen(false);
    }
  }, [isCancellingAssignment]);

  const handleConfirmCancelAssignment = async (): Promise<void> => {
    if (!user) return;
    setIsCancellingAssignment(true);
    try {
      const updated = await cancelAssignedJourney(user.id);
      queryClient.setQueryData(["admin", "user", userId], updated);
      setIsCancelAssignModalOpen(false);
      setJourneySuccessMessage(t("activeJourney.cancelSuccess"));
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
    cancel: t("assignJourney.cancel"),
    confirm: t("assignJourney.confirm"),
    submitting: t("assignJourney.submitting"),
  };

  const cancelAssignmentLabels: CancelAssignmentModalLabels = {
    modalTitle: t("activeJourney.cancelModalTitle"),
    modalDescription: (title: string) =>
      t("activeJourney.cancelModalDescription", { title }),
    keepButton: t("activeJourney.cancelModalKeep"),
    confirmButton: t("activeJourney.cancelModalConfirm"),
    cancellingButton: t("activeJourney.cancellingButton"),
  };

  const canDeleteUser = can("users.manage");
  const canManageRoles = can("users.change_profile");
  const canManageUser = can("users.manage") || can("users.deactivate");
  const canAssignJourney = can("journeys.assign");
  const canCancelAssignment = Boolean(
    activeJourney &&
      activeJourney.origin === "assigned" &&
      activeJourney.assigned_by &&
      authUser &&
      String(activeJourney.assigned_by.id) === String(authUser.id)
  );

  return {
    user,
    isLoading,
    isError,
    errorMessage,
    handleRetry,

    isTogglingStatus,
    handleToggleStatus,

    showInactiveBanner,
    handleDismissBanner,
    handleDontShowAgain,

    formData,
    formErrors,
    isDirty,
    isSaving,
    saveSuccessMessage,
    handleFieldChange,
    handleResetForm,
    handleSaveForm,

    activeJourney,
    assignableOptions,
    isFirstJourney,
    selectedProfileId,
    isAssignModalOpen,
    isAssigningJourney,
    isCancelAssignModalOpen,
    isCancellingAssignment,
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
    handleOpenDeleteModal,
    handleCloseDeleteModal,
    handleConfirmDelete,

    canDeleteUser,
    canManageRoles,
    canManageUser,

    labels,
  };
}
