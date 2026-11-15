"use client";

import { ShieldCheck } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Button } from "@/components/ui";
import { IdiomSwitch } from "@/components/layout/IdiomSwitch";
import { SwitchThemeButton } from "@/components/layout/SwitchThemeButton";
import { usePrivacyPolicyVM } from "./privacyPolicy.viewmodel";

export function PrivacyPolicyView() {
  const { labels, handleBack } = usePrivacyPolicyVM();

  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex w-full items-center p-4 gap-2">
        <div className="ml-auto flex items-center gap-2">
          <IdiomSwitch />
          <SwitchThemeButton />
        </div>
      </header>

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
              {labels.subtitle}
            </p>

            <div className="mt-9 w-full rounded-[2rem] border border-border bg-card/90 px-6 py-7 text-left shadow-xl backdrop-blur-xl">
              <div className="mb-5">
                <h2 className="font-heading text-lg font-bold text-card-foreground">
                  {labels.cardTitle}
                </h2>
              </div>

              <div className="space-y-4 text-sm leading-relaxed text-muted-foreground">
                <p>{labels.notice}</p>
              </div>

              <div className="mt-8 flex justify-end">
                <Button
                  type="button"
                  onClick={handleBack}
                  variant="outline"
                  className="rounded-full px-6"
                >
                  {labels.backButton}
                </Button>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

export default PrivacyPolicyView;
