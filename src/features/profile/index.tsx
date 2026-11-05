"use client";

import { Edit02Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Button, Input, Message, MetricsGrid } from "@/components/ui";
import { PageShell } from "@/components/layout/PageShell";
import { IdiomSwitch } from "@/components/layout/IdiomSwitch";
import { useProfileVM } from "./profile.viewmodel";

export function ProfileView() {
  const {
    profile,
    initials,
    form,
    isLoading,
    isLoadError,
    isEditing,
    isSubmitting,
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
  } = useProfileVM();
  const errors = form.formState.errors;

  return (
    <PageShell title={labels.title} subtitle={labels.subtitle}>
      <div className="mx-auto max-w-5xl space-y-8">
        {serverMessage && (
          <Message
            title={serverMessage.title}
            description={serverMessage.description}
            variant={serverMessage.variant}
            onClose={handleCloseMessage}
            closeLabel={labels.closeMessage}
          />
        )}

        {isLoadError ? (
          <section className="space-y-4" aria-labelledby="profile-load-error">
            <Message
              id="profile-load-error"
              title={labels.loadErrorTitle}
              description={labels.loadErrorDescription}
              variant="destructive"
            />
            <Button type="button" variant="outline" onClick={handleRetry}>
              {labels.retry}
            </Button>
          </section>
        ) : (
          <>
            <section aria-label={labels.personalData}>
              <article
                aria-busy={isLoading}
                className="overflow-hidden rounded-[2rem] border border-border bg-card/80 shadow-sm backdrop-blur-xl"
              >
                <header className="relative flex min-h-32 items-end gap-4 bg-primary/15 px-6 pb-5 pt-10">
                  <div
                    aria-hidden="true"
                    className="flex size-16 shrink-0 items-center justify-center rounded-2xl border-2 border-background bg-primary/20 text-xl font-bold text-primary"
                  >
                    {isLoading ? "" : initials}
                  </div>
                  <div className="min-w-0 flex-1 pb-1">
                    {isLoading ? (
                      <div
                        aria-busy="true"
                        aria-label={labels.loading}
                        className="h-6 w-40 animate-pulse rounded bg-muted"
                      />
                    ) : (
                      <>
                        <h2 className="truncate font-heading text-xl font-semibold text-foreground">
                          {profile?.user.name}
                        </h2>
                        <p className="mt-1 truncate text-sm text-muted-foreground">
                          {profile?.user.organization || labels.notProvided}
                        </p>
                      </>
                    )}
                  </div>
                  {profile && !isEditing && (
                    <Button
                      type="button"
                      onClick={handleEdit}
                      className="mb-1 shrink-0"
                    >
                      <HugeiconsIcon icon={Edit02Icon} size={16} />
                      {labels.editProfile}
                    </Button>
                  )}
                </header>

                <div className="p-6 md:p-8">
                  <section aria-labelledby="profile-data-heading">
                    <h2
                      id="profile-data-heading"
                      className="mb-5 font-heading text-lg font-semibold text-foreground"
                    >
                      {labels.personalData}
                    </h2>

                    {isLoading ? (
                      <div
                        aria-busy="true"
                        aria-label={labels.loading}
                        className="grid grid-cols-1 gap-4 sm:grid-cols-2"
                      >
                        {Array.from({ length: 5 }, (_, index) => (
                          <div
                            key={index}
                            className="h-16 animate-pulse rounded-xl bg-muted/60"
                          />
                        ))}
                      </div>
                    ) : isEditing ? (
                      <form onSubmit={handleSubmit} noValidate>
                        <fieldset disabled={isSubmitting} className="space-y-5">
                          <legend className="sr-only">
                            {labels.personalData}
                          </legend>
                          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div className="space-y-1.5">
                              <label htmlFor="profile-name" className="text-sm font-medium">
                                {labels.fullName}
                                <span aria-hidden="true"> *</span>
                              </label>
                              <Input
                                id="profile-name"
                                autoComplete="name"
                                aria-required="true"
                                aria-invalid={Boolean(errors.name)}
                                {...form.register("name")}
                              />
                              {errors.name?.message && (
                                <p className="text-sm text-destructive">
                                  {errors.name.message}
                                </p>
                              )}
                            </div>

                            <div className="space-y-1.5">
                              <label htmlFor="profile-organization" className="text-sm font-medium">
                                {labels.organization}
                                <span aria-hidden="true"> *</span>
                              </label>
                              <Input
                                id="profile-organization"
                                autoComplete="organization"
                                aria-required="true"
                                aria-invalid={Boolean(errors.organization)}
                                {...form.register("organization")}
                              />
                              {errors.organization?.message && (
                                <p className="text-sm text-destructive">
                                  {errors.organization.message}
                                </p>
                              )}
                            </div>

                            <div className="space-y-1.5">
                              <label htmlFor="profile-email" className="text-sm font-medium">
                                {labels.email}
                                <span aria-hidden="true"> *</span>
                              </label>
                              <Input
                                id="profile-email"
                                type="email"
                                autoComplete="email"
                                aria-required="true"
                                aria-invalid={Boolean(errors.email)}
                                {...form.register("email")}
                              />
                              {errors.email?.message && (
                                <p className="text-sm text-destructive">
                                  {errors.email.message}
                                </p>
                              )}
                            </div>

                            <div className="space-y-1.5">
                              <label htmlFor="profile-employee-code" className="text-sm font-medium">
                                {labels.employeeCode}
                              </label>
                              <Input
                                id="profile-employee-code"
                                value={profile?.user.employeeCode ?? ""}
                                disabled
                                aria-describedby="profile-employee-code-help"
                              />
                              <p
                                id="profile-employee-code-help"
                                className="text-xs text-muted-foreground"
                              >
                                {labels.employeeCodeHelp}
                              </p>
                            </div>

                            <div className="space-y-1.5 sm:col-span-2">
                              <label htmlFor="profile-department" className="text-sm font-medium">
                                {labels.department}
                                <span aria-hidden="true"> *</span>
                              </label>
                              <Input
                                id="profile-department"
                                aria-required="true"
                                aria-invalid={Boolean(errors.department)}
                                {...form.register("department")}
                              />
                              {errors.department?.message && (
                                <p className="text-sm text-destructive">
                                  {errors.department.message}
                                </p>
                              )}
                            </div>
                          </div>

                          <div className="flex flex-wrap justify-end gap-3">
                            <Button
                              type="button"
                              variant="outline"
                              onClick={handleCancel}
                              disabled={isSubmitting}
                            >
                              {labels.cancel}
                            </Button>
                            <Button type="submit" disabled={isSubmitting}>
                              {labels.save}
                            </Button>
                          </div>
                        </fieldset>
                      </form>
                    ) : (
                      <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        {[
                          [labels.fullName, profile?.user.name],
                          [labels.organization, profile?.user.organization],
                          [labels.email, profile?.user.email],
                          [labels.employeeCode, profile?.user.employeeCode],
                          [labels.department, profile?.user.department],
                        ].map(([label, value]) => (
                          <div
                            key={label}
                            className="rounded-xl border border-border/70 bg-background/40 p-4"
                          >
                            <dt className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                              {label}
                            </dt>
                            <dd className="mt-1 break-words text-sm text-foreground">
                              {value || labels.notProvided}
                            </dd>
                          </div>
                        ))}
                      </dl>
                    )}
                  </section>
                </div>
              </article>
            </section>

            <section aria-labelledby="profile-activity-heading" className="space-y-4">
              <h2
                id="profile-activity-heading"
                className="font-heading text-xl font-semibold text-foreground"
              >
                {labels.activityTitle}
              </h2>
              <MetricsGrid
                items={metrics}
                isLoading={isLoading}
                loadingLabel={labels.loading}
              />
            </section>

            <section
              aria-labelledby="profile-preferences-heading"
              className="rounded-[2rem] border border-border bg-card/80 p-6 shadow-sm backdrop-blur-xl md:p-8"
            >
              <h2
                id="profile-preferences-heading"
                className="mb-6 font-heading text-xl font-semibold text-foreground"
              >
                {labels.preferencesTitle}
              </h2>
              <div className="grid gap-8 sm:grid-cols-2">
                <fieldset className="space-y-3">
                  <legend className="text-sm font-medium">{labels.language}</legend>
                  <IdiomSwitch />
                </fieldset>
                <fieldset className="space-y-3">
                  <legend className="text-sm font-medium">{labels.theme}</legend>
                  <div className="flex flex-wrap gap-2">
                    <label className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-border px-3 py-2 text-sm">
                      <input
                        type="radio"
                        name="profile-theme"
                        value="light"
                        checked={theme === "light"}
                        onChange={() => handleThemeChange("light")}
                      />
                      {labels.themeLight}
                    </label>
                    <label className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-border px-3 py-2 text-sm">
                      <input
                        type="radio"
                        name="profile-theme"
                        value="dark"
                        checked={theme === "dark"}
                        onChange={() => handleThemeChange("dark")}
                      />
                      {labels.themeDark}
                    </label>
                    <label
                      title={labels.themeHighContrastUnavailable}
                      className="inline-flex cursor-not-allowed items-center gap-2 rounded-full border border-border px-3 py-2 text-sm opacity-50"
                    >
                      <input
                        type="radio"
                        name="profile-theme"
                        value="high-contrast"
                        disabled
                      />
                      {labels.themeHighContrast}
                    </label>
                  </div>
                </fieldset>
              </div>
            </section>
          </>
        )}
      </div>
    </PageShell>
  );
}

export default ProfileView;
