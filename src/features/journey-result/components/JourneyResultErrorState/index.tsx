"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import { AlertCircleIcon, ArrowLeft01Icon } from "@hugeicons/core-free-icons";
import { Link } from "@shared/i18n/navigation";
import { Button } from "@components/ui";
import { useJourneyResultErrorStateVM } from "./journeyResultErrorState.viewmodel";
import type { JourneyResultErrorStateProps } from "./journeyResultErrorState.types";

/** Substitui o conteúdo da tela quando o resultado não pode ser exibido. */
export function JourneyResultErrorState(props: JourneyResultErrorStateProps) {
  const { title, message, linkText, linkHref, canRetry, retryLabel, handleRetry } =
    useJourneyResultErrorStateVM(props);

  return (
    <div
      role="alert"
      data-testid="journey-result-error-state"
      className="mx-auto flex max-w-3xl flex-col items-center justify-center gap-3 rounded-[2rem] border border-destructive/30 bg-destructive/5 p-10 text-center"
    >
      <HugeiconsIcon icon={AlertCircleIcon} size={32} aria-hidden="true" className="text-destructive" />
      <h2 className="text-lg font-bold text-foreground">{title}</h2>
      <p className="max-w-md text-sm text-muted-foreground">{message}</p>
      <div className="mt-2 flex flex-wrap items-center justify-center gap-4">
        {canRetry && (
          <Button variant="outline" onClick={handleRetry}>
            {retryLabel}
          </Button>
        )}
        <Link
          href={linkHref}
          className="inline-flex items-center gap-1.5 rounded text-sm font-semibold text-primary hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
        >
          <HugeiconsIcon icon={ArrowLeft01Icon} size={16} aria-hidden="true" />
          {linkText}
        </Link>
      </div>
    </div>
  );
}

export * from "./journeyResultErrorState.types";
