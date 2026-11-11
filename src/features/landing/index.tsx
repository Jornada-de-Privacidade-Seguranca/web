"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowDown02Icon,
  ArrowRight01Icon,
  ArrowRight02Icon,
  Shield01Icon,
} from "@hugeicons/core-free-icons";

import { Button } from "@/components/ui";
import { IdiomSwitch } from "@/components/layout/IdiomSwitch";
import { Link } from "@/shared/i18n/navigation";
import { SwitchThemeButton } from "@/components/layout/SwitchThemeButton";
import { useLandingVM } from "./landing.viewmodel";

export function LandingView() {
  const { labels, steps, extra, isReady, handleScrollToHowItWorks, handleScrollToTop } =
    useLandingVM();

  if (!isReady) {
    return null;
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top,color-mix(in_oklab,var(--primary)_14%,transparent),transparent_28%),linear-gradient(180deg,color-mix(in_oklab,var(--background)_92%,var(--primary)_8%),var(--background)_42%)] text-foreground">
      <div className="relative mx-auto flex min-h-screen w-full max-w-7xl flex-col px-4 pb-8 pt-4 md:px-8">
        <header className="flex items-center gap-4 bg-transparent">
          <button
            type="button"
            className="flex min-w-0 cursor-pointer items-center gap-2 transition-opacity hover:opacity-80"
            onClick={handleScrollToTop}
          >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary ring-1 ring-primary/15">
              <HugeiconsIcon icon={Shield01Icon} size={16} aria-hidden="true" />
            </div>
            <span className="truncate text-sm font-semibold text-foreground">
              {labels.brand}
            </span>
          </button>

          <nav className="hidden items-center gap-6 text-sm text-muted-foreground md:flex">
            <a
              className="cursor-pointer transition-colors hover:text-foreground"
              href="#como-funciona"
              onClick={handleScrollToHowItWorks}
            >
              {labels.header.howItWorks}
            </a>
          </nav>

          <div className="ml-auto flex items-center gap-2">
            <IdiomSwitch />
            <SwitchThemeButton />

            <Button asChild className="rounded-full px-4 font-semibold">
              <Link href="/login">{labels.header.login}</Link>
            </Button>
          </div>
        </header>

        <section className="flex flex-1 items-center justify-center pb-16 pt-16 md:pb-20 md:pt-24">
          <div className="max-w-4xl text-center">
            <div className="mx-auto mb-6 inline-flex items-center rounded-full border border-border/70 bg-card/80 px-4 py-1 text-xs text-muted-foreground shadow-sm backdrop-blur">
              {labels.hero.eyebrow}
            </div>

            <h1 className="mx-auto max-w-4xl text-balance text-4xl font-semibold tracking-tighter text-foreground sm:text-5xl md:text-6xl">
              {labels.hero.title}
            </h1>

            <p className="mx-auto mt-6 max-w-2xl text-pretty text-base leading-7 text-muted-foreground md:text-lg">
              {labels.hero.description}
            </p>

            <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button
                asChild
                size="lg"
                className="rounded-full px-6 font-semibold shadow-lg shadow-primary/20"
              >
                <Link href="/login">
                  {labels.hero.primaryAction}
                  <HugeiconsIcon icon={ArrowRight01Icon} aria-hidden="true" />
                </Link>
              </Button>

              <Button
                asChild
                variant="ghost"
                size="lg"
                className="rounded-full px-6 text-foreground/80"
              >
                <a href="#como-funciona" onClick={handleScrollToHowItWorks}>
                  {labels.hero.secondaryAction}
                </a>
              </Button>
            </div>
          </div>
        </section>

        <section id="como-funciona" className="pb-16 pt-6 md:pb-24">
          <div className="mx-auto max-w-6xl text-center">
            <h2 className="text-3xl font-semibold tracking-tighter text-foreground md:text-4xl">
              {labels.steps.title}
            </h2>
            <p className="mt-3 text-sm text-muted-foreground md:text-base">
              {labels.steps.description}
            </p>

            <ol className="mt-10 grid grid-cols-1 md:grid-cols-3 md:gap-x-8">
              {steps.map((step) => (
                <li key={step.number} className="flex flex-col">
                  <div className="relative flex-1">
                    <article className="group flex h-full flex-col rounded-[1.5rem] border border-border/70 bg-card/80 p-6 text-left shadow-sm backdrop-blur-sm transition-transform duration-300 hover:-translate-y-1 hover:shadow-xl">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary ring-1 ring-primary/10 transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                          <HugeiconsIcon icon={step.icon} size={20} aria-hidden="true" />
                        </div>
                        <span className="text-xs font-medium tracking-[0.18em] text-muted-foreground">
                          {step.number}
                        </span>
                      </div>

                      <h3 className="mt-6 text-lg font-semibold text-foreground">
                        {step.title}
                      </h3>
                      <p className="mt-3 text-sm leading-6 text-muted-foreground">
                        {step.description}
                      </p>
                    </article>

                    {step.showRightArrowOnDesktop && (
                      <div
                        aria-hidden="true"
                        data-testid={`step-${step.number}-arrow-right`}
                        className="pointer-events-none absolute -right-8 top-1/2 hidden w-8 -translate-y-1/2 items-center justify-center text-muted-foreground/70 md:flex"
                      >
                        <HugeiconsIcon icon={ArrowRight02Icon} size={18} />
                      </div>
                    )}
                  </div>

                  <div
                    aria-hidden="true"
                    data-testid={`step-${step.number}-arrow-down`}
                    className="flex h-9 items-center justify-center text-muted-foreground/70"
                  >
                    <HugeiconsIcon
                      icon={ArrowDown02Icon}
                      size={18}
                      className={step.showDownArrowOnDesktop ? undefined : "md:hidden"}
                    />
                  </div>
                </li>
              ))}
            </ol>

            {/* Bloco Extra: largura total com borda tracejada */}
            <article className="rounded-[1.5rem] border-2 border-dashed border-primary/40 bg-card/65 p-6 text-left shadow-sm backdrop-blur-sm high-contrast:border-primary">
              <div className="flex items-start justify-between gap-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary ring-1 ring-primary/15">
                  <HugeiconsIcon icon={extra.icon} size={20} aria-hidden="true" />
                </div>
                <span className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  {extra.badge}
                </span>
              </div>

              <h3 className="mt-6 text-lg font-semibold text-foreground">
                {extra.title}
              </h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                {extra.description}
              </p>
            </article>
          </div>
        </section>

        <footer className="mt-auto flex flex-col gap-2 border-t border-border/60 py-4 text-xs text-muted-foreground md:flex-row md:items-center md:justify-between">
          <span>{labels.footer.left}</span>
          <div className="flex flex-wrap items-center gap-4">
            <Link
              href="/privacy-terms"
              className="font-medium text-foreground/80 underline-offset-4 transition-colors hover:text-foreground hover:underline"
            >
              {labels.footer.privacyLink}
            </Link>
            <span>{labels.footer.right}</span>
          </div>
        </footer>
      </div>
    </main>
  );
}
