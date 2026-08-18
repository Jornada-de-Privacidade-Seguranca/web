"use client";

import {
  CheckListIcon,
  Search01Icon,
  ArrowRight01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Link } from "@/shared/i18n/navigation";
import { Button } from "@/components/ui/button";
import { useResultsEmptyStateVM } from "./resultsEmptyState.viewmodel";
import type { ResultsEmptyStateProps } from "./resultsEmptyState.types";

export function ResultsEmptyState(props: ResultsEmptyStateProps) {
  const {
    title,
    description,
    ctaText,
    ctaHref,
    isNoResults,
    hasCta,
  } = useResultsEmptyStateVM(props);

  return (
    <div
      data-testid="results-empty-state"
      className="flex flex-col items-center justify-center rounded-[2rem] border border-dashed border-border bg-card/40 p-10 text-center backdrop-blur-sm"
    >
      <div aria-hidden="true" className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary mb-4">
        <HugeiconsIcon
          icon={isNoResults ? CheckListIcon : Search01Icon}
          size={28}
        />
      </div>

      <h3 className="text-lg font-bold tracking-tight text-foreground font-heading mb-1">
        {title}
      </h3>

      <p className="max-w-md text-sm text-muted-foreground leading-relaxed mb-6">
        {description}
      </p>

      {hasCta && ctaText && (
        <Button asChild size="lg" className="rounded-full font-semibold">
          <Link href={ctaHref}>
            <span>{ctaText}</span>
            <HugeiconsIcon icon={ArrowRight01Icon} size={18} className="ml-2" />
          </Link>
        </Button>
      )}
    </div>
  );
}

export default ResultsEmptyState;
