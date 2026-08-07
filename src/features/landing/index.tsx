"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowRight01Icon,
  Shield01Icon,
} from "@hugeicons/core-free-icons";

import { Button } from "@/components/ui";
import { IdiomSwitch } from "@/components/layout/IdiomSwitch";
import { Link } from "@/shared/i18n/navigation";
import { SwitchThemeButton } from "@/components/layout/SwitchThemeButton";
import { useLandingVM } from "./landing.viewmodel";

export function LandingView() {
  const { labels, steps, handleScrollToHowItWorks, handleScrollToTop } =
    useLandingVM();

  return (
    <main className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top,color-mix(in_oklab,var(--primary)_14%,transparent),transparent_28%),linear-gradient(180deg,color-mix(in_oklab,var(--background)_92%,var(--primary)_8%),var(--background)_42%)] text-foreground">
      {/* <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-24 top-12 h-72 w-72 rounded-full bg-primary/12 blur-3xl" />
        <div className="absolute -right-20 top-32 h-96 w-96 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-linear-to-t from-background/95 to-transparent" />
      </div> */}

      <div className="relative mx-auto flex min-h-screen w-full max-w-7xl flex-col px-4 pb-8 pt-4 md:px-8">
        <header 
        // className="flex items-center gap-4 rounded-full border border-border/70 bg-background/70 px-4 py-3 shadow-sm backdrop-blur-xl"
        className='flex items-center gap-4 background-transparent'
        >
          <div
            className="flex min-w-0 cursor-pointer items-center gap-2 transition-opacity hover:opacity-80"
            onClick={handleScrollToTop}
          >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary ring-1 ring-primary/15">
              <HugeiconsIcon icon={Shield01Icon} size={16} />
            </div>
            <span className="truncate text-sm font-semibold text-foreground">
              {labels.brand}
            </span>
          </div>

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
                  <HugeiconsIcon icon={ArrowRight01Icon} />
                </Link>
              </Button>

              <Button
                asChild
                variant="ghost"
                size="lg"
                className="rounded-full px-6 text-foreground/80"
              >
                <a
                  href="#como-funciona"
                  onClick={handleScrollToHowItWorks}
                >
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

            <div className="mt-10 grid gap-4 md:grid-cols-3">
              {steps.map((step) => (
                <article
                  key={step.number}
                  className="group rounded-[1.5rem] border border-border/70 bg-card/80 p-6 text-left shadow-sm backdrop-blur-sm transition-transform duration-300 hover:-translate-y-1 hover:shadow-xl"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary ring-1 ring-primary/10 transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                      <HugeiconsIcon icon={step.icon} size={20} />
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
              ))}
            </div>
          </div>
        </section>

        <footer className="mt-auto flex flex-col gap-2 border-t border-border/60 py-4 text-xs text-muted-foreground md:flex-row md:items-center md:justify-between">
          <span>{labels.footer.left}</span>
          <span>{labels.footer.right}</span>
        </footer>
      </div>
    </main>
  );
}
