"use client";

import {
  ArrowLeft01Icon,
  InformationCircleIcon,
  Loading03Icon,
  Mail01Icon,
  MailSend01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Link } from "@/shared/i18n/navigation";
import { Button, Input, Message } from "@/components/ui";
import { PageShell } from "@/components/layout/PageShell";
import type { UserRole } from "@features/admin-users/adminUsers.types";
import { useAdminUserInviteVM } from "./adminUserInvite.viewmodel";

export function AdminUserInviteView() {
  const {
    email,
    role,
    summaryTitle,
    summaryRoleLabel,
    roleOptions,
    canChangeProfile,
    emailError,
    submitError,
    isSubmitting,
    labels,
    handleEmailChange,
    handleRoleChange,
    handleCancel,
    handleSubmit,
  } = useAdminUserInviteVM();

  return (
    <PageShell title={labels.pageTitle} subtitle={labels.pageSubtitle}>
      <div className="mx-auto max-w-3xl space-y-6">
        <Button
          asChild
          variant="ghost"
          size="sm"
          className="h-8 -ml-2 text-xs text-muted-foreground hover:text-foreground"
        >
          <Link href="/admin/usuarios">
            <HugeiconsIcon icon={ArrowLeft01Icon} size={16} className="mr-1.5" />
            <span>{labels.backToList}</span>
          </Link>
        </Button>

        {/* Card de Resumo em tempo real */}
        <section
          aria-label={labels.summaryBadge}
          className="flex items-center gap-4 rounded-3xl border border-border/80 bg-card/90 p-6 shadow-md backdrop-blur-md"
        >
          <div
            aria-hidden="true"
            className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary ring-2 ring-primary/20"
          >
            <HugeiconsIcon icon={Mail01Icon} size={24} />
          </div>
          <div className="min-w-0 flex-1 space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="truncate font-heading text-lg font-bold text-foreground">
                {summaryTitle}
              </h2>
              <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary">
                {labels.summaryBadge}
              </span>
            </div>
            <p className="text-xs font-medium text-muted-foreground">
              {summaryRoleLabel}
            </p>
          </div>
        </section>

        {/* Formulário de Convite */}
        <form onSubmit={handleSubmit} noValidate className="space-y-6">
          <div className="rounded-3xl border border-border/80 bg-card/90 p-6 shadow-md backdrop-blur-md space-y-6">
            <div>
              <h3 className="font-heading text-lg font-bold text-foreground">
                {labels.formTitle}
              </h3>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {labels.formSubtitle}
              </p>
            </div>

            {submitError && (
              <Message variant="destructive" title={submitError} />
            )}

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <div className="space-y-1.5">
                <label
                  htmlFor="invite-user-email"
                  className="text-xs font-semibold text-foreground"
                >
                  {labels.emailLabel} *
                </label>
                <Input
                  id="invite-user-email"
                  type="email"
                  value={email}
                  placeholder={labels.emailPlaceholder}
                  disabled={isSubmitting}
                  onChange={(e) => handleEmailChange(e.target.value)}
                  className="h-11 rounded-2xl border-border/80 bg-background text-sm"
                  aria-required="true"
                  aria-invalid={Boolean(emailError)}
                  aria-describedby={emailError ? "invite-email-error" : undefined}
                />
                {emailError && (
                  <p
                    id="invite-email-error"
                    role="alert"
                    className="text-xs font-medium text-destructive"
                  >
                    {emailError}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor="invite-user-role"
                  className="text-xs font-semibold text-foreground"
                >
                  {labels.roleLabel} *
                </label>
                <select
                  id="invite-user-role"
                  value={role}
                  disabled={!canChangeProfile || isSubmitting}
                  onChange={(e) => handleRoleChange(e.target.value as UserRole)}
                  className={`h-11 w-full rounded-2xl border border-border/80 bg-background px-4 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 ${
                    !canChangeProfile || isSubmitting
                      ? "cursor-not-allowed bg-muted/40 opacity-60"
                      : ""
                  }`}
                >
                  {roleOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                {!canChangeProfile && (
                  <p className="text-xs text-muted-foreground">
                    {labels.roleLockedHint}
                  </p>
                )}
              </div>
            </div>

            {/* Nota informativa */}
            <div className="flex items-start gap-3 rounded-2xl border border-primary/20 bg-primary/5 p-4 text-xs text-foreground">
              <HugeiconsIcon
                icon={InformationCircleIcon}
                size={18}
                className="mt-0.5 shrink-0 text-primary"
              />
              <p className="leading-relaxed">{labels.infoNotice}</p>
            </div>

            <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                disabled={isSubmitting}
                className="h-10 rounded-full px-5 text-xs font-semibold"
              >
                {labels.cancelButton}
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                aria-busy={isSubmitting}
                className="h-10 rounded-full px-5 text-xs font-semibold shadow-sm"
              >
                <HugeiconsIcon
                  icon={isSubmitting ? Loading03Icon : MailSend01Icon}
                  size={14}
                  className={`mr-1.5 ${isSubmitting ? "animate-spin" : ""}`}
                />
                <span>
                  {isSubmitting ? labels.submittingButton : labels.submitButton}
                </span>
              </Button>
            </div>
          </div>
        </form>
      </div>
    </PageShell>
  );
}

export default AdminUserInviteView;
