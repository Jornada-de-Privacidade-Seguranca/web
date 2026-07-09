"use client";

import { ShieldCheck } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

import { Button, Input } from "@/components/ui";

import { useAuthVM } from "./auth.viewmodel";

export function AuthView() {
  const { form, labels, handleSubmit } = useAuthVM();
  const { register, formState } = form;
  const errors = formState.errors;

  return (
    <main className="flex min-h-[calc(100vh-4rem)] flex-1 items-center justify-center px-4 py-10">
      <div className="relative w-full max-w-120">
        <div className="pointer-events-none absolute -inset-10 rounded-full bg-[radial-gradient(circle,rgba(96,165,250,0.18),transparent_60%)] blur-3xl" />

        <section className="relative flex flex-col items-center text-center">
          <div className="mb-5 flex h-15 w-15 items-center justify-center rounded-full bg-[rgba(96,165,250,0.16)] text-[rgb(96,165,250)] ring-1 ring-[rgba(96,165,250,0.12)]">
            <HugeiconsIcon icon={ShieldCheck} size={25} />
          </div>

          <h1 className="text-[1.9rem] font-medium tracking-[-0.03em] text-[oklch(0.98_0.01_250)]">
            {labels.title}
          </h1>
          <p className="mt-2 max-w-[50ch] text-sm text-[oklch(0.79_0.03_250)]">
            {labels.description}
          </p>

          <form
            className="mt-9 w-full rounded-[2rem] border border-[rgba(255,255,255,0.08)] bg-[rgba(30,41,59,0.92)] px-6 py-7 text-left shadow-[0_20px_80px_rgba(0,0,0,0.35)] backdrop-blur-xl"
            onSubmit={handleSubmit}
            noValidate
          >
            <div className="mb-5">
              <h2 className="text-lg font-bold font-heading text-[oklch(0.98_0.01_250)]">
                {labels.welcomeTitle}
              </h2>
              <p className="mt-1 text-sm text-[oklch(0.74_0.03_250)]">
                {labels.welcomeDescription}
              </p>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label
                  className="text-[0.68rem] font-medium uppercase tracking-[0.12em] text-[oklch(0.72_0.03_250)]"
                  htmlFor="username"
                >
                  {labels.usernameLabel}
                </label>
                <Input
                  id="username"
                  aria-invalid={Boolean(errors.username)}
                  {...register("username")}
                  placeholder={labels.usernamePlaceholder}
                  className="h-10 border-[rgba(255,255,255,0.09)] bg-[rgba(15,23,42,0.18)] text-[oklch(0.98_0.01_250)] placeholder:text-[oklch(0.64_0.04_250)]"
                  autoComplete="username"
                />
                {errors.username?.message ? (
                  <p className="text-xs text-red-300">
                    {errors.username.message}
                  </p>
                ) : null}
              </div>

              <div className="space-y-1.5">
                <label
                  className="text-[0.68rem] font-medium uppercase tracking-[0.12em] text-[oklch(0.72_0.03_250)]"
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
                  className="h-10 border-[rgba(255,255,255,0.09)] bg-[rgba(15,23,42,0.18)] text-[oklch(0.98_0.01_250)] placeholder:text-[oklch(0.64_0.04_250)]"
                  autoComplete="current-password"
                />
                {errors.password?.message ? (
                  <p className="text-xs text-red-300">
                    {errors.password.message}
                  </p>
                ) : null}
              </div>
            </div>

            <div className="mt-3 flex justify-end">
              <Button
                type="button"
                variant="link"
                className="h-auto px-0 text-xs font-medium text-[rgb(96,165,250)]"
              >
                {labels.forgotPassword}
              </Button>
            </div>

            <Button
              className="mt-4 h-11 w-full rounded-full bg-[rgb(96,165,250)] text-sm font-semibold text-slate-950 hover:bg-[rgb(120,178,255)]"
              type="submit"
              disabled={formState.isSubmitting}
            >
              {labels.submit}
            </Button>

            <p className="mt-6 text-center text-sm text-[oklch(0.72_0.03_250)]">
              <span>{labels.signUpPrefix} </span>
              <Button
                type="button"
                variant="link"
                className="h-auto px-0 text-sm font-medium text-[rgb(96,165,250)] hover:no-underline"
              >
                {labels.signUpLink}
              </Button>
            </p>

            <p className="mt-3 text-center text-xs leading-5 text-[oklch(0.6_0.03_250)]">
              {labels.privacyNotice}
            </p>
          </form>
        </section>
      </div>
    </main>
  );
}
