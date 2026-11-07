"use client";

import { UserIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useWelcomeSummaryVM } from "./welcomeSummary.viewmodel";
import type { WelcomeSummaryProps } from "./welcomeSummary.types";

export function WelcomeSummary(props: WelcomeSummaryProps) {
  const {
    userRole,
    organization,
    greetingTitle,
    greetingSubtitle,
    organizationLabelText,
  } = useWelcomeSummaryVM(props);

  return (
    <header className="relative overflow-hidden rounded-[2rem] border border-border/60 bg-gradient-to-br from-card via-card to-primary/5 p-6 md:p-8 shadow-sm backdrop-blur-md">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-foreground">
              {greetingTitle}
            </h1>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary ring-1 ring-primary/20">
              <HugeiconsIcon icon={UserIcon} size={14} />
              <span>{userRole}</span>
            </span>
          </div>

          <p className="text-sm md:text-base text-muted-foreground max-w-2xl">
            {greetingSubtitle}
          </p>
        </div>

        {organization && (
          <div className="self-start md:self-center shrink-0 rounded-2xl border border-border/50 bg-background/60 px-4 py-2.5 backdrop-blur-sm">
            <span className="text-xs font-medium text-muted-foreground">
              {organizationLabelText}
            </span>
          </div>
        )}
      </div>
    </header>
  );
}

