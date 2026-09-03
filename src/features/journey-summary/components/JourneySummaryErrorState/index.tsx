"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import { AlertCircleIcon, ArrowLeft01Icon } from "@hugeicons/core-free-icons";
import { Link } from "@/shared/i18n/navigation";
import { useJourneySummaryErrorStateVM } from "./journeySummaryErrorState.viewmodel";
import type { JourneySummaryErrorStateProps } from "./journeySummaryErrorState.types";

export function JourneySummaryErrorState(props: JourneySummaryErrorStateProps) {
  const { title, message, backHref, backLinkText, backLinkId } =
    useJourneySummaryErrorStateVM(props);

  return (
    <div
      role="alert"
      data-testid="journey-summary-error-state"
      className="flex flex-col items-center justify-center gap-3 rounded-[2rem] border border-destructive/30 bg-destructive/5 p-10 text-center"
    >
      <HugeiconsIcon icon={AlertCircleIcon} size={32} className="text-destructive" />
      <h2 className="text-lg font-bold text-foreground">{title}</h2>
      <p className="max-w-md text-sm text-muted-foreground">{message}</p>
      <Link
        id={backLinkId}
        href={backHref}
        className="mt-2 inline-flex items-center gap-1.5 rounded text-sm font-semibold text-primary hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
      >
        <HugeiconsIcon icon={ArrowLeft01Icon} size={16} />
        {backLinkText}
      </Link>
    </div>
  );
}
