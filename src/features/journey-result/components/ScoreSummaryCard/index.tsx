"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowLeft01Icon,
  RefreshIcon,
  SecurityCheckIcon,
} from "@hugeicons/core-free-icons";
import { Link } from "@shared/i18n/navigation";
import { Button, ScoreBar } from "@components/ui";
import { useScoreSummaryCardVM } from "./scoreSummaryCard.viewmodel";
import type { ScoreSummaryCardProps } from "./scoreSummaryCard.types";

/** Card da nota geral, a única seção da tela que não é recolhível. */
export function ScoreSummaryCard(props: ScoreSummaryCardProps) {
  const {
    journeyTitle,
    score,
    overallLabel,
    scoreAriaLabel,
    declaredCountText,
    retakeHref,
    retakeLabel,
    backHref,
    backLabel,
  } = useScoreSummaryCardVM(props);

  return (
    <section
      data-testid="score-summary-card"
      className="rounded-[2rem] border border-border bg-card/90 p-6 shadow-md backdrop-blur-xl md:p-8"
    >
      <div className="flex items-center gap-3">
        <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-primary/15 text-primary">
          <HugeiconsIcon icon={SecurityCheckIcon} size={24} aria-hidden="true" />
        </div>
        <div className="min-w-0">
          <p className="text-[0.68rem] font-bold uppercase tracking-[0.12em] text-muted-foreground">
            {overallLabel}
          </p>
          <h2 className="font-heading text-lg font-bold tracking-tight text-card-foreground">
            {journeyTitle}
          </h2>
        </div>
      </div>

      <div className="mt-6">
        <ScoreBar
          value={score.value}
          band={score.band}
          bandLabel={score.bandLabel}
          ariaLabel={scoreAriaLabel}
        />
      </div>
      <p className="mt-3 text-sm text-muted-foreground">{declaredCountText}</p>

      <div className="mt-6 flex flex-wrap gap-3">
        <Button asChild className="gap-2">
          <Link href={retakeHref}>
            <HugeiconsIcon icon={RefreshIcon} size={16} aria-hidden="true" />
            {retakeLabel}
          </Link>
        </Button>
        <Button asChild variant="ghost" className="gap-2">
          <Link href={backHref}>
            <HugeiconsIcon icon={ArrowLeft01Icon} size={16} aria-hidden="true" />
            {backLabel}
          </Link>
        </Button>
      </div>
    </section>
  );
}

export * from "./scoreSummaryCard.types";
