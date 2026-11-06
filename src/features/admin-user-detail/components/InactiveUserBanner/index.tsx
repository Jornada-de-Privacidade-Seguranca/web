"use client";

import { AlertCircleIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Button } from "@/components/ui";
import { useInactiveUserBannerVM } from "./inactiveUserBanner.viewmodel";
import type { InactiveUserBannerProps } from "./inactiveUserBanner.types";

export function InactiveUserBanner(props: InactiveUserBannerProps) {
  const {
    isVisible,
    title,
    description,
    activateNowText,
    dismissText,
    dontShowAgainText,
    onActivateNow,
    onDismiss,
    onDontShowAgain,
  } = useInactiveUserBannerVM(props);

  if (!isVisible) return null;

  return (
    <div
      role="alert"
      className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 rounded-3xl border border-amber-500/30 bg-amber-500/10 p-5 text-amber-900 dark:text-amber-200 shadow-sm backdrop-blur-md animate-in fade-in-50"
    >
      <div className="flex items-start gap-3">
        <HugeiconsIcon
          icon={AlertCircleIcon}
          size={22}
          className="text-amber-600 dark:text-amber-400 shrink-0 mt-0.5"
        />
        <div>
          <h4 className="font-heading text-sm font-bold">{title}</h4>
          <p className="mt-0.5 text-xs text-amber-800 dark:text-amber-300/90 leading-relaxed">
            {description}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 shrink-0 self-end md:self-auto">
        <Button
          type="button"
          size="sm"
          onClick={onActivateNow}
          className="h-8 rounded-full bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold px-3"
        >
          {activateNowText}
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onDismiss}
          className="h-8 rounded-full text-xs hover:bg-amber-500/20 px-3"
        >
          {dismissText}
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onDontShowAgain}
          className="h-8 rounded-full text-[11px] text-muted-foreground hover:text-foreground px-2.5"
        >
          {dontShowAgainText}
        </Button>
      </div>
    </div>
  );
}

export * from "./inactiveUserBanner.types";
