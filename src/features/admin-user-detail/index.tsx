"use client";

import { RefreshIcon, AlertDiamondIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Button } from "@/components/ui";
import { PageShell } from "@/components/layout/PageShell";
import { useAdminUserDetailVM } from "./adminUserDetail.viewmodel";
import {
  UserHeader,
  InactiveUserBanner,
  UserEditForm,
  UserJourneysSection,
  DeleteUserModal,
} from "./components";

interface AdminUserDetailViewProps {
  userId: string;
}

export function AdminUserDetailView({ userId }: AdminUserDetailViewProps) {
  const {
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

    journeys,

    isDeleteModalOpen,
    isDeleting,
    handleOpenDeleteModal,
    handleCloseDeleteModal,
    handleConfirmDelete,

    canDeleteUser,
    canManageRoles,
    canManageUser,

    labels,
  } = useAdminUserDetailVM({ userId });

  if (isLoading) {
    return (
      <PageShell title={labels.formTitle} subtitle={labels.formSubtitle}>
        <div data-testid="user-detail-skeleton" className="space-y-6 animate-pulse">
          <div className="h-28 rounded-3xl border border-border/40 bg-muted/40" />
          <div className="h-96 rounded-3xl border border-border/40 bg-muted/40" />
        </div>
      </PageShell>
    );
  }

  if (isError || !user) {
    return (
      <PageShell title={labels.formTitle} subtitle={labels.formSubtitle}>
        <div className="flex flex-col items-center justify-center rounded-3xl border border-destructive/30 bg-destructive/5 p-8 text-center space-y-3">
          <p className="text-sm font-medium text-destructive">
            {errorMessage || "Usuário não encontrado."}
          </p>
          <Button onClick={handleRetry} variant="outline" size="sm">
            <HugeiconsIcon icon={RefreshIcon} size={14} className="mr-1.5" />
            Tentar novamente
          </Button>
        </div>
      </PageShell>
    );
  }

  const displayName = user.name?.trim() || user.email;
  const displayDepartment = user.department?.trim() || "—";

  return (
    <PageShell title={displayName} subtitle={`${displayDepartment} • ${user.roleLabel}`}>
      <div className="space-y-8">
        {/* Cabeçalho do Usuário */}
        <UserHeader
          user={user}
          labels={labels}
          isTogglingStatus={isTogglingStatus}
          canManageUser={canManageUser}
          onToggleStatus={handleToggleStatus}
        />

        {/* Banner de Usuário Inativo (Condicional) */}
        {showInactiveBanner && (
          <InactiveUserBanner
            isVisible={showInactiveBanner}
            labels={labels}
            onActivateNow={handleToggleStatus}
            onDismiss={handleDismissBanner}
            onDontShowAgain={handleDontShowAgain}
          />
        )}

        {/* Formulário de Edição com Barra Fixa */}
        <UserEditForm
          formData={formData}
          formErrors={formErrors}
          isDirty={isDirty}
          isSaving={isSaving}
          saveSuccessMessage={saveSuccessMessage}
          labels={labels}
          canManageRoles={canManageRoles}
          canManageUser={canManageUser}
          onFieldChange={handleFieldChange}
          onResetForm={handleResetForm}
          onSaveForm={handleSaveForm}
        />

        {/* Seção de Trilhas e Jornadas Realizadas */}
        <UserJourneysSection
          userId={user.id}
          journeys={journeys}
          labels={labels}
        />

        {/* Seção: Zona de Perigo (Exclusão Restrita a Administradores) */}
        {canDeleteUser && (
          <section
            aria-labelledby="danger-zone-title"
            className="rounded-3xl border border-destructive/30 bg-destructive/5 p-6 space-y-4"
          >
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-destructive">
                  <HugeiconsIcon icon={AlertDiamondIcon} size={20} />
                  <h3
                    id="danger-zone-title"
                    className="font-heading text-base font-bold"
                  >
                    {labels.dangerZoneTitle}
                  </h3>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed max-w-2xl">
                  {labels.dangerZoneDescription}
                </p>
              </div>

              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={handleOpenDeleteModal}
                className="rounded-full text-xs font-semibold px-4 shrink-0 shadow-sm"
              >
                {labels.dangerZoneDeleteButton}
              </Button>
            </div>
          </section>
        )}

        {/* Modal de Confirmação de Exclusão */}
        {canDeleteUser && (
          <DeleteUserModal
            isOpen={isDeleteModalOpen}
            userName={displayName}
            isDeleting={isDeleting}
            labels={labels}
            onCancel={handleCloseDeleteModal}
            onConfirm={handleConfirmDelete}
          />
        )}
      </div>
    </PageShell>
  );
}

export default AdminUserDetailView;
