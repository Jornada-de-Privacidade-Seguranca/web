"use client";

import { useEffect, useRef } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { AlertCircleIcon, ArrowLeft01Icon } from "@hugeicons/core-free-icons";
import { Link } from "@shared/i18n/navigation";
import { useJourneyNotFoundStateVM } from "./journeyNotFoundState.viewmodel";
import type { JourneyNotFoundStateProps } from "./journeyNotFoundState.types";

export function JourneyNotFoundState(props: JourneyNotFoundStateProps) {
  const { title, message, backHref, backLinkText } =
    useJourneyNotFoundStateVM(props);
  const linkRef = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    linkRef.current?.focus();
  }, []);

  return (
    <div className="mx-auto flex min-h-full w-full max-w-3xl flex-col justify-center px-4 py-12">
      <div
        role="alert"
        data-testid="journey-not-found-state"
        className="flex flex-col items-center justify-center gap-3 rounded-[2rem] border border-destructive/30 bg-destructive/5 p-10 text-center"
      >
        <HugeiconsIcon icon={AlertCircleIcon} size={32} className="text-destructive" />
        <h2 className="text-lg font-bold text-foreground">{title}</h2>
        <p className="max-w-md text-sm text-muted-foreground">{message}</p>
        <Link
          ref={linkRef}
          href={backHref}
          className="mt-2 inline-flex items-center gap-1.5 rounded text-sm font-semibold text-primary hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
        >
          <HugeiconsIcon icon={ArrowLeft01Icon} size={16} />
          {backLinkText}
        </Link>
      </div>
    </div>
  );
}
