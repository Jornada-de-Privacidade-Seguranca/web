"use client";

import { ShieldCheck } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

import { Button, Input, Message } from "@/components/ui";

import { useAuthVM } from "./auth.viewmodel";

export function AuthView() {
  const { form, labels, handleSubmit, serverMessage, onCloseMsg } = useAuthVM();
  const { register, formState } = form;
  const errors = formState.errors;

  return (
    <main className="flex min-h-[calc(100vh-4rem)] flex-1 items-center justify-center px-4 py-10">
      <div className="relative w-full max-w-120">
        <div className="pointer-events-none absolute -inset-10 rounded-full bg-[radial-gradient(circle,color-mix(in_oklab,var(--primary)_18%,transparent),transparent_60%)] blur-3xl" />

        <section className="relative flex flex-col items-center text-center">
          <div className="mb-5 flex h-15 w-15 items-center justify-center rounded-full bg-primary/15 text-primary ring-1 ring-primary/15">
            <HugeiconsIcon icon={ShieldCheck} size={25} />
          </div>

          <h1 className="text-[1.9rem] font-medium tracking-[-0.03em] text-foreground">
            {labels.title}
          </h1>
          <p className="mt-2 max-w-[50ch] text-sm text-muted-foreground">
            {labels.description}
          </p>

          {serverMessage && (
            <div className="mt-6 w-full text-left">
              <Message
                title={serverMessage.title}
                description={serverMessage.description}
                icon={serverMessage.icon}
                variant={serverMessage.variant}
                onClose={onCloseMsg}
              />
            </div>
          )}

          <form
            className="mt-9 w-full rounded-[2rem] border border-border bg-card/90 px-6 py-7 text-left shadow-xl backdrop-blur-xl"
            onSubmit={handleSubmit}
            noValidate
          >
            <div className="mb-5">
              <h2 className="font-heading text-lg font-bold text-card-foreground">
                {labels.welcomeTitle}
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {labels.welcomeDescription}
              </p>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label
                  className="text-[0.68rem] font-medium uppercase tracking-[0.12em] text-muted-foreground"
                  htmlFor="username"
                >
                  {labels.usernameLabel}
                </label>
                <Input
                  id="username"
                  aria-invalid={Boolean(errors.username)}
                  {...register("username")}
                  placeholder={labels.usernamePlaceholder}
                  className="h-10 border-input bg-input/30 text-foreground placeholder:text-muted-foreground"
                  autoComplete="username"
                />
                {errors.username?.message ? (
                  <p className="text-xs text-destructive">
                    {errors.username.message}
                  </p>
                ) : null}
              </div>

              <div className="space-y-1.5">
                <label
                  className="text-[0.68rem] font-medium uppercase tracking-[0.12em] text-muted-foreground"
                  htmlFor="password"
                >
                  {labels.passwordLabel}
                </label>
                <Input
                  id="password"
                  type="password"
                  aria-invalid={Boolean(errors.password)}
                  {...register("password")}
                  placeholder={labels.passwordPlaceholder}
                  className="h-10 border-input bg-input/30 text-foreground placeholder:text-muted-foreground"
                  autoComplete="current-password"
                />
                {errors.password?.message ? (
                  <p className="text-xs text-destructive">
                    {errors.password.message}
                  </p>
                ) : null}
              </div>
            </div>

            <div className="mt-3 flex justify-end">
              <Button
                type="button"
                variant="link"
                className="h-auto px-0 text-xs font-medium text-primary"
              >
                {labels.forgotPassword}
              </Button>
            </div>

            <Button
              className="mt-4 h-11 w-full rounded-full bg-primary text-sm font-semibold text-primary-foreground hover:bg-primary/90"
              type="submit"
              disabled={formState.isSubmitting}
            >
              {labels.submit}
            </Button>

            <p className="mt-6 text-center text-sm text-muted-foreground">
              <span>{labels.signUpPrefix} </span>
              <Button
                type="button"
                variant="link"
                className="h-auto px-0 text-sm font-medium text-primary hover:no-underline"
              >
                {labels.signUpLink}
              </Button>
            </p>

            <p className="mt-3 text-center text-xs leading-5 text-muted-foreground">
              {labels.privacyNotice}
            </p>
          </form>
        </section>
      </div>
    </main>
  );
}
