"use client";

import {
  FloppyDiskIcon,
  Cancel01Icon,
  AlertCircleIcon,
  CheckmarkCircle02Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Button, Input } from "@/components/ui";
import { useUserEditFormVM } from "./userEditForm.viewmodel";
import type { UserEditFormProps } from "./userEditForm.types";
import type { UserRole } from "../../adminUserDetail.types";

export function UserEditForm(props: UserEditFormProps) {
  const {
    formData,
    formErrors,
    isDirty,
    isSaving,
    saveSuccessMessage,
    saveErrorMessage,
    labels,
    roleOptions,
    canManageRoles,
    canManageUser,
    onFieldChange,
    onResetForm,
    onSubmit,
  } = useUserEditFormVM(props);

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div className="rounded-3xl border border-border/80 bg-card/90 p-6 shadow-md backdrop-blur-md space-y-6">
        <div>
          <h2 className="font-heading text-lg font-bold text-foreground">
            {labels.formTitle}
          </h2>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {labels.formSubtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Campo: Nome Completo */}
          <div className="space-y-1.5">
            <label
              htmlFor="edit-user-name"
              className="text-xs font-semibold text-foreground"
            >
              {labels.formName} *
            </label>
            <Input
              id="edit-user-name"
              type="text"
              value={formData.name}
              onChange={(e) => onFieldChange("name", e.target.value)}
              className="h-11 rounded-2xl bg-background border-border/80 text-sm"
              aria-invalid={!!formErrors.name}
              aria-describedby={formErrors.name ? "name-error" : undefined}
            />
            {formErrors.name && (
              <p id="name-error" className="text-xs text-destructive font-medium">
                {formErrors.name}
              </p>
            )}
          </div>

          {/* Campo: E-mail Institucional */}
          <div className="space-y-1.5">
            <label
              htmlFor="edit-user-email"
              className="text-xs font-semibold text-foreground"
            >
              {labels.formEmail} *
            </label>
            <Input
              id="edit-user-email"
              type="email"
              value={formData.email}
              onChange={(e) => onFieldChange("email", e.target.value)}
              className="h-11 rounded-2xl bg-background border-border/80 text-sm"
              aria-invalid={!!formErrors.email}
              aria-describedby={formErrors.email ? "email-error" : undefined}
            />
            {formErrors.email && (
              <p id="email-error" className="text-xs text-destructive font-medium">
                {formErrors.email}
              </p>
            )}
          </div>

          {/* Campo: Órgão / Empresa */}
          <div className="space-y-1.5">
            <label
              htmlFor="edit-user-organization"
              className="text-xs font-semibold text-foreground"
            >
              {labels.formOrganization}
            </label>
            <Input
              id="edit-user-organization"
              type="text"
              value={formData.organization}
              onChange={(e) => onFieldChange("organization", e.target.value)}
              className="h-11 rounded-2xl bg-background border-border/80 text-sm"
              aria-invalid={!!formErrors.organization}
              aria-describedby={formErrors.organization ? "organization-error" : undefined}
            />
            {formErrors.organization && (
              <p id="organization-error" className="text-xs text-destructive font-medium">
                {formErrors.organization}
              </p>
            )}
          </div>

          {/* Campo: Código de Funcionário */}
          <div className="space-y-1.5">
            <label
              htmlFor="edit-user-code"
              className="text-xs font-semibold text-foreground"
            >
              {labels.formEmployeeCode} *
            </label>
            <Input
              id="edit-user-code"
              type="text"
              value={formData.employeeCode}
              onChange={(e) => onFieldChange("employeeCode", e.target.value)}
              className="h-11 rounded-2xl bg-background border-border/80 text-sm font-mono"
              aria-invalid={!!formErrors.employeeCode}
              aria-describedby={formErrors.employeeCode ? "code-error" : undefined}
            />
            {formErrors.employeeCode && (
              <p id="code-error" className="text-xs text-destructive font-medium">
                {formErrors.employeeCode}
              </p>
            )}
          </div>

          {/* Campo: Setor / Área */}
          <div className="space-y-1.5">
            <label
              htmlFor="edit-user-dept"
              className="text-xs font-semibold text-foreground"
            >
              {labels.formDepartment} *
            </label>
            <Input
              id="edit-user-dept"
              type="text"
              value={formData.department}
              onChange={(e) => onFieldChange("department", e.target.value)}
              className="h-11 rounded-2xl bg-background border-border/80 text-sm"
              aria-invalid={!!formErrors.department}
              aria-describedby={formErrors.department ? "dept-error" : undefined}
            />
            {formErrors.department && (
              <p id="dept-error" className="text-xs text-destructive font-medium">
                {formErrors.department}
              </p>
            )}
          </div>

          {/* Campo: Perfil de Acesso */}
          <div className="space-y-1.5">
            <label
              htmlFor="edit-user-role"
              className="text-xs font-semibold text-foreground"
            >
              {labels.formRole} *
            </label>
            <select
              id="edit-user-role"
              value={formData.role}
              disabled={!canManageRoles || !canManageUser}
              onChange={(e) => onFieldChange("role", e.target.value as UserRole)}
              aria-invalid={!!formErrors.role}
              aria-describedby={formErrors.role ? "role-error" : undefined}
              className={`w-full h-11 rounded-2xl bg-background border border-border/80 px-4 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 ${
                !canManageRoles || !canManageUser
                  ? "opacity-60 cursor-not-allowed bg-muted/40"
                  : ""
              }`}
            >
              {roleOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            {formErrors.role && (
              <p id="role-error" className="text-xs text-destructive font-medium">
                {formErrors.role}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Barra de Ações Fixa no Rodapé (apenas com permissão de gerenciamento) */}
      {canManageUser && (
        <aside
          aria-label="Barra de ações do formulário"
          className="sticky bottom-4 z-20 flex flex-col sm:flex-row items-center justify-between gap-3 rounded-2xl border border-border/80 bg-card/95 p-4 shadow-xl backdrop-blur-xl animate-in fade-in-50 duration-200"
        >
          <div className="flex items-center gap-2">
            {saveErrorMessage ? (
              <div
                role="alert"
                className="flex items-center gap-2 text-xs font-semibold text-destructive"
              >
                <HugeiconsIcon icon={AlertCircleIcon} size={16} />
                <span>{saveErrorMessage}</span>
              </div>
            ) : saveSuccessMessage ? (
              <div
                role="status"
                className="flex items-center gap-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400"
              >
                <HugeiconsIcon icon={CheckmarkCircle02Icon} size={16} />
                <span>{saveSuccessMessage}</span>
              </div>
            ) : isDirty ? (
              <div
                role="status"
                className="flex items-center gap-2 text-xs font-semibold text-amber-600 dark:text-amber-400"
              >
                <HugeiconsIcon icon={AlertCircleIcon} size={16} />
                <span>{labels.formUnsavedChanges}</span>
              </div>
            ) : (
              <span className="text-xs text-muted-foreground">
                {labels.formSubtitle}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onResetForm}
              disabled={!isDirty || isSaving}
              className="h-10 rounded-full text-xs font-semibold px-4"
            >
              <HugeiconsIcon icon={Cancel01Icon} size={14} className="mr-1.5" />
              <span>{labels.formCancel}</span>
            </Button>

            <Button
              type="submit"
              size="sm"
              disabled={!isDirty || isSaving}
              className="h-10 rounded-full text-xs font-semibold px-5 shadow-md"
            >
              <HugeiconsIcon icon={FloppyDiskIcon} size={14} className="mr-1.5" />
              <span>{isSaving ? labels.formSaving : labels.formSave}</span>
            </Button>
          </div>
        </aside>
      )}
    </form>
  );
}

export * from "./userEditForm.types";
