"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
import { useTranslations } from "next-intl";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "@/shared/i18n/navigation";
import {
  getUserById,
  updateUser,
  toggleUserStatus,
  deleteUser,
} from "@services/usersService";
import type {
  AdminUserDetailViewModelReturn,
  AdminUserDetailLabels,
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
  const router = useRouter();
  const queryClient = useQueryClient();

  const userQuery = useQuery({
    queryKey: ["admin", "user", userId],
    queryFn: () => getUserById(userId),
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

    journeys: user?.journeys ?? [],

    isDeleteModalOpen,
    isDeleting,
    handleOpenDeleteModal,
    handleCloseDeleteModal,
    handleConfirmDelete,

    labels,
  };
}
