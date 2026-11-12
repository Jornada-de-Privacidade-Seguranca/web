"use client";

import { ShieldCheck } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

import { Button, Input, Message } from "@/components/ui";
import { Link } from "@/shared/i18n/navigation";

import { useInitialPasswordVM } from "./initialPassword.viewmodel";
import type { InitialPasswordFormValues } from "./initialPassword.types";

const LABEL_CLASS =
  "text-[0.68rem] font-medium uppercase tracking-[0.12em] text-muted-foreground";
const INPUT_CLASS =
  "h-10 border-input bg-input/30 text-foreground placeholder:text-muted-foreground";

export function InitialPasswordView() {
  const {
    status,
    email,
    form,
    isSubmitting,
    serverMessage,
    onCloseMsg,
    handleSubmit,
    handleRetry,
    labels,
  } = useInitialPasswordVM();
  const { register, formState } = form;
  const errors = formState.errors;

  function renderField(
    name: keyof InitialPasswordFormValues,
    label: string,
    placeholder: string,
    options: { type?: "text" | "password"; autoComplete?: string } = {}
  ) {
    const message = errors[name]?.message;
    const errorId = `${name}-error`;
    return (
      <div className="space-y-1.5">
        <label className={LABEL_CLASS} htmlFor={name}>
          {label}
        </label>
        <Input
          id={name}
          type={options.type ?? "text"}
          aria-invalid={Boolean(message)}
          aria-describedby={message ? errorId : undefined}
          {...register(name)}
          placeholder={placeholder}
          className={INPUT_CLASS}
          autoComplete={options.autoComplete}
        />
        {message ? (
          <p id={errorId} className="text-xs text-destructive">
            {message}
          </p>
        ) : null}
      </div>
    );
  }

  return (
    <main className="flex min-h-[calc(100vh-4rem)] flex-1 items-center justify-center px-4 py-10">
      <div className="relative w-full max-w-140">
        <div className="pointer-events-none absolute -inset-10 rounded-full bg-[radial-gradient(circle,color-mix(in_oklab,var(--primary)_18%,transparent),transparent_60%)] blur-3xl" />

        <section className="relative flex flex-col items-center text-center">
          <div className="mb-5 flex h-15 w-15 items-center justify-center rounded-full bg-primary/15 text-primary ring-1 ring-primary/15">
            <HugeiconsIcon icon={ShieldCheck} size={25} />
          </div>

          <p className="text-[1.9rem] font-medium tracking-[-0.03em] text-foreground">
            {labels.appName}
          </p>
          <p className="mt-2 max-w-[50ch] text-sm text-muted-foreground">
            {labels.tagline}
          </p>

          <div className="mt-9 w-full rounded-[2rem] border border-border bg-card/90 px-6 py-7 text-left shadow-xl backdrop-blur-xl">
            <h1 className="font-heading text-lg font-bold text-card-foreground">
              {labels.title}
            </h1>

            {status === "validating" ? (
              <p role="status" aria-busy="true" className="mt-4 text-sm text-muted-foreground">
                {labels.validating}
              </p>
            ) : null}

            {status === "invalid" ? (
              <div className="mt-4 space-y-6">
                <p role="alert" className="text-sm text-muted-foreground">
                  {labels.invalidInvitation}
                </p>
                <Button asChild variant="outline" className="h-11 w-full rounded-full">
                  <Link href="/login">{labels.backToLogin}</Link>
                </Button>
              </div>
            ) : null}

            {status === "validation_failed" ? (
              <div className="mt-4 space-y-6">
                <p role="alert" className="text-sm text-muted-foreground">
                  {labels.validationFailed}
                </p>
                <Button
                  type="button"
                  variant="outline"
                  className="h-11 w-full rounded-full"
                  onClick={handleRetry}
                >
                  {labels.retry}
                </Button>
              </div>
            ) : null}

            {status === "ready" ? (
              <>
                <p className="mt-1 text-sm text-muted-foreground">{labels.subtitle}</p>

                {serverMessage ? (
                  <div className="mt-5">
                    <Message
                      title={serverMessage.title}
                      description={serverMessage.description}
                      variant={serverMessage.variant}
                      onClose={onCloseMsg}
                    />
                  </div>
                ) : null}

                <form className="mt-6 space-y-4" onSubmit={handleSubmit} noValidate>
                  <div className="space-y-1.5">
                    <label className={LABEL_CLASS} htmlFor="email">
                      {labels.emailLabel}
                    </label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      readOnly
                      aria-readonly="true"
                      className={`${INPUT_CLASS} cursor-default text-muted-foreground`}
                    />
                  </div>

                  {renderField("nomeCompleto", labels.fullNameLabel, labels.fullNamePlaceholder, {
                    autoComplete: "name",
                  })}
                  {renderField("empresa", labels.companyLabel, labels.companyPlaceholder, {
                    autoComplete: "organization",
                  })}

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    {renderField("departamento", labels.departmentLabel, labels.departmentPlaceholder)}
                    {renderField(
                      "codigoFuncionario",
                      labels.employeeCodeLabel,
                      labels.employeeCodePlaceholder
                    )}
                  </div>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    {renderField("senha", labels.passwordLabel, labels.passwordPlaceholder, {
                      type: "password",
                      autoComplete: "new-password",
                    })}
                    {renderField(
                      "confirmarSenha",
                      labels.confirmPasswordLabel,
                      labels.confirmPasswordPlaceholder,
                      { type: "password", autoComplete: "new-password" }
                    )}
                  </div>

                  <Button
                    className="mt-2 h-11 w-full rounded-full bg-primary text-sm font-semibold text-primary-foreground hover:bg-primary/90"
                    type="submit"
                    disabled={isSubmitting}
                    aria-busy={isSubmitting}
                  >
                    {isSubmitting ? labels.submitting : labels.submit}
                  </Button>
                </form>
              </>
            ) : null}
          </div>
        </section>
      </div>
    </main>
  );
}
