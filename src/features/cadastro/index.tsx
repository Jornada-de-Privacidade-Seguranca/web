"use client";

import { ShieldCheck } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

import { Button, Input, Message } from "@/components/ui";
import { Link } from "@/shared/i18n/navigation";

import { useCadastroVM } from "./cadastro.viewmodel";

export function CadastroView() {
  const { form, labels, handleSubmit, serverMessage, onCloseMsg } = useCadastroVM();
  const { register, formState } = form;
  const errors = formState.errors;

  return (
    <main className="flex min-h-[calc(100vh-4rem)] flex-1 items-center justify-center px-4 py-10">
      <div className="relative w-full max-w-140">
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
                {labels.cardTitle}
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {labels.cardSubtitle}
              </p>
            </div>

            <div className="space-y-4">
              {/* Nome completo */}
              <div className="space-y-1.5">
                <label
                  className="text-[0.68rem] font-medium uppercase tracking-[0.12em] text-muted-foreground"
                  htmlFor="nomeCompleto"
                >
                  {labels.fullNameLabel}
                </label>
                <Input
                  id="nomeCompleto"
                  aria-invalid={Boolean(errors.nomeCompleto)}
                  {...register("nomeCompleto")}
                  placeholder={labels.fullNamePlaceholder}
                  className="h-10 border-input bg-input/30 text-foreground placeholder:text-muted-foreground"
                  autoComplete="name"
                />
                {errors.nomeCompleto?.message ? (
                  <p className="text-xs text-destructive">
                    {errors.nomeCompleto.message}
                  </p>
                ) : null}
              </div>

              {/* Código de funcionário & Departamento */}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-1.5">
                  <label
                    className="text-[0.68rem] font-medium uppercase tracking-[0.12em] text-muted-foreground"
                    htmlFor="codigoFuncionario"
                  >
                    {labels.employeeCodeLabel}
                  </label>
                  <Input
                    id="codigoFuncionario"
                    aria-invalid={Boolean(errors.codigoFuncionario)}
                    {...register("codigoFuncionario")}
                    placeholder={labels.employeeCodePlaceholder}
                    className="h-10 border-input bg-input/30 text-foreground placeholder:text-muted-foreground"
                  />
                  {errors.codigoFuncionario?.message ? (
                    <p className="text-xs text-destructive">
                      {errors.codigoFuncionario.message}
                    </p>
                  ) : null}
                </div>

                <div className="space-y-1.5">
                  <label
                    className="text-[0.68rem] font-medium uppercase tracking-[0.12em] text-muted-foreground"
                    htmlFor="departamento"
                  >
                    {labels.departmentLabel}
                  </label>
                  <Input
                    id="departamento"
                    aria-invalid={Boolean(errors.departamento)}
                    {...register("departamento")}
                    placeholder={labels.departmentPlaceholder}
                    className="h-10 border-input bg-input/30 text-foreground placeholder:text-muted-foreground"
                  />
                  {errors.departamento?.message ? (
                    <p className="text-xs text-destructive">
                      {errors.departamento.message}
                    </p>
                  ) : null}
                </div>
              </div>

              {/* Órgão ou empresa */}
              <div className="space-y-1.5">
                <label
                  className="text-[0.68rem] font-medium uppercase tracking-[0.12em] text-muted-foreground"
                  htmlFor="empresa"
                >
                  {labels.companyLabel}
                </label>
                <Input
                  id="empresa"
                  aria-invalid={Boolean(errors.empresa)}
                  {...register("empresa")}
                  placeholder={labels.companyPlaceholder}
                  className="h-10 border-input bg-input/30 text-foreground placeholder:text-muted-foreground"
                  autoComplete="organization"
                />
                {errors.empresa?.message ? (
                  <p className="text-xs text-destructive">
                    {errors.empresa.message}
                  </p>
                ) : null}
              </div>

              {/* E-mail institucional */}
              <div className="space-y-1.5">
                <label
                  className="text-[0.68rem] font-medium uppercase tracking-[0.12em] text-muted-foreground"
                  htmlFor="email"
                >
                  {labels.emailLabel}
                </label>
                <Input
                  id="email"
                  type="email"
                  aria-invalid={Boolean(errors.email)}
                  {...register("email")}
                  placeholder={labels.emailPlaceholder}
                  className="h-10 border-input bg-input/30 text-foreground placeholder:text-muted-foreground"
                  autoComplete="email"
                />
                {errors.email?.message ? (
                  <p className="text-xs text-destructive">
                    {errors.email.message}
                  </p>
                ) : null}
              </div>

              {/* Senha & Confirmar Senha */}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-1.5">
                  <label
                    className="text-[0.68rem] font-medium uppercase tracking-[0.12em] text-muted-foreground"
                    htmlFor="senha"
                  >
                    {labels.passwordLabel}
                  </label>
                  <Input
                    id="senha"
                    type="password"
                    aria-invalid={Boolean(errors.senha)}
                    {...register("senha")}
                    placeholder={labels.passwordPlaceholder}
                    className="h-10 border-input bg-input/30 text-foreground placeholder:text-muted-foreground"
                    autoComplete="new-password"
                  />
                  {errors.senha?.message ? (
                    <p className="text-xs text-destructive">
                      {errors.senha.message}
                    </p>
                  ) : null}
                </div>

                <div className="space-y-1.5">
                  <label
                    className="text-[0.68rem] font-medium uppercase tracking-[0.12em] text-muted-foreground"
                    htmlFor="confirmarSenha"
                  >
                    {labels.confirmPasswordLabel}
                  </label>
                  <Input
                    id="confirmarSenha"
                    type="password"
                    aria-invalid={Boolean(errors.confirmarSenha)}
                    {...register("confirmarSenha")}
                    placeholder={labels.confirmPasswordPlaceholder}
                    className="h-10 border-input bg-input/30 text-foreground placeholder:text-muted-foreground"
                    autoComplete="new-password"
                  />
                  {errors.confirmarSenha?.message ? (
                    <p className="text-xs text-destructive">
                      {errors.confirmarSenha.message}
                    </p>
                  ) : null}
                </div>
              </div>

              {/* Termos de uso e política de privacidade */}
              <div className="pt-2">
                <div className="flex items-start gap-2.5">
                  <input
                    id="aceitouTermos"
                    type="checkbox"
                    aria-invalid={Boolean(errors.aceitouTermos)}
                    {...register("aceitouTermos")}
                    className="mt-0.5 h-4 w-4 shrink-0 rounded border-input bg-input/30 text-primary accent-primary focus:ring-primary"
                  />
                  <label
                    htmlFor="aceitouTermos"
                    className="cursor-pointer text-xs leading-snug text-muted-foreground"
                  >
                    {labels.termsCheckbox}
                  </label>
                </div>
                {errors.aceitouTermos?.message ? (
                  <p className="mt-1 text-xs text-destructive">
                    {errors.aceitouTermos.message}
                  </p>
                ) : null}
              </div>
            </div>

            <Button
              className="mt-6 h-11 w-full rounded-full bg-primary text-sm font-semibold text-primary-foreground hover:bg-primary/90"
              type="submit"
              disabled={formState.isSubmitting}
            >
              {labels.submit}
            </Button>

            <p className="mt-6 text-center text-sm text-muted-foreground">
              <span>{labels.hasAccountText} </span>
              <Button
                asChild
                type="button"
                variant="link"
                className="h-auto px-0 text-sm font-medium text-primary hover:no-underline"
              >
                <Link href="/login">{labels.loginLink}</Link>
              </Button>
            </p>
          </form>
        </section>
      </div>
    </main>
  );
}
