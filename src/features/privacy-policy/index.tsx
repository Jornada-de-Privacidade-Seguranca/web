"use client";

import { ArrowLeft01Icon, Shield01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Button } from "@/components/ui";
import { IdiomSwitch } from "@/components/layout/IdiomSwitch";
import { SwitchThemeButton } from "@/components/layout/SwitchThemeButton";
import { Link } from "@/shared/i18n/navigation";
import { usePrivacyPolicyVM } from "./privacyPolicy.viewmodel";
import { PrivacyPolicySectionCard, PrivacyPolicyToc } from "./components";

export function PrivacyPolicyView() {
  const { labels, sections, backHref, primaryCtaHref } = usePrivacyPolicyVM();

  return (
    <main className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top,color-mix(in_oklab,var(--primary)_14%,transparent),transparent_28%),linear-gradient(180deg,color-mix(in_oklab,var(--background)_92%,var(--primary)_8%),var(--background)_42%)] text-foreground">
      <div className="relative mx-auto flex min-h-screen w-full max-w-5xl flex-col px-4 pb-10 pt-4 md:px-8">
        <header className="flex flex-wrap items-center gap-3">
          <Link
            href={backHref}
            className="flex min-w-0 items-center gap-2 transition-opacity hover:opacity-80"
          >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary ring-1 ring-primary/15">
              <HugeiconsIcon icon={Shield01Icon} size={16} aria-hidden="true" />
            </div>
            <span className="truncate text-sm font-semibold text-foreground">
              {labels.brand}
            </span>
          </Link>

          <div className="ml-auto flex items-center gap-2">
            <IdiomSwitch />
            <SwitchThemeButton />

            <Button asChild className="rounded-full px-4 font-semibold">
              <Link href={primaryCtaHref}>{labels.primaryCtaLabel}</Link>
            </Button>
          </div>
        </header>

        <div className="mt-10 flex-1 space-y-8 md:mt-12">
          <div className="space-y-4">
            <Button
              asChild
              variant="ghost"
              size="sm"
              className="-ml-2 h-8 rounded-full px-3 text-xs font-medium text-muted-foreground hover:text-foreground"
            >
              <Link href={backHref}>
                <HugeiconsIcon icon={ArrowLeft01Icon} size={14} aria-hidden="true" className="mr-1.5" />
                <span>{labels.backLinkLabel}</span>
              </Link>
            </Button>

            <div className="inline-flex items-center rounded-full border border-border/70 bg-card/80 px-4 py-1 text-xs font-medium text-muted-foreground shadow-sm backdrop-blur">
              {labels.eyebrow}
            </div>

            <h1 className="font-heading text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              {labels.title}
            </h1>

            <p className="max-w-3xl text-base leading-7 text-muted-foreground">
              {labels.subtitle}
            </p>

            <p className="text-xs font-medium text-muted-foreground">
              <span>{labels.lastUpdatedLabel}: </span>
              <span className="text-foreground">{labels.lastUpdatedDate}</span>
            </p>
          </div>

          <PrivacyPolicyToc title={labels.tocTitle} sections={sections} />

          <article aria-label={labels.title} className="space-y-5">
            {sections.map((section) => (
              <PrivacyPolicySectionCard key={section.id} section={section} />
            ))}
          </article>
        </div>

        <footer className="mt-12 flex flex-col gap-2 border-t border-border/60 pt-6 text-xs text-muted-foreground md:flex-row md:items-center md:justify-between">
          <span>{labels.footerLeft}</span>
          <span>{labels.footerRight}</span>
        </footer>
      </div>
    </main>
  );
}

export default PrivacyPolicyView;

