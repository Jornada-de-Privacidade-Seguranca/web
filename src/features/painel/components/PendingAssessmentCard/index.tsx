"use client";

import { CheckListIcon, Clock01Icon, ArrowRight01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Link } from "@/shared/i18n/navigation";
import { Button } from "@/components/ui";
import { EmptyState } from "../EmptyState";
import { usePendingAssessmentCardVM } from "./pendingAssessmentCard.viewmodel";
import type { PendingAssessmentCardProps } from "./pendingAssessmentCard.types";

export function PendingAssessmentCard(props: PendingAssessmentCardProps) {
  const {
    assessment,
    emptyMessage,
    badgeLabel,
    badgeVariant,
    buttonText,
    actionHref,
    questionsText,
    timeText,
  } = usePendingAssessmentCardVM(props);

  if (!assessment) {
    return <EmptyState message={emptyMessage} />;
  }

  return (
    <article className="relative flex flex-col justify-between rounded-[2rem] border border-border bg-card/90 p-6 shadow-xl backdrop-blur-xl transition-all duration-200 hover:border-primary/30">
      <div>
        <div className="flex items-center justify-between gap-3">
          <span
            className={`inline-flex items-center rounded-full px-3 py-1 text-[0.68rem] font-bold uppercase tracking-[0.12em] ${
              badgeVariant === "pending"
                ? "bg-amber-500/15 text-amber-600 dark:text-amber-400 ring-1 ring-amber-500/20"
                : "bg-primary/15 text-primary ring-1 ring-primary/20"
            }`}
          >
            {badgeLabel}
          </span>
        </div>

        <h3 className="mt-4 font-heading text-xl font-bold tracking-tight text-card-foreground">
          {assessment.title}
        </h3>

        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          {assessment.description}
        </p>

        <div className="mt-6 flex flex-wrap items-center gap-4 text-xs font-medium text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <HugeiconsIcon icon={CheckListIcon} size={16} className="text-primary" />
            <span>{questionsText}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <HugeiconsIcon icon={Clock01Icon} size={16} className="text-primary" />
            <span>{timeText}</span>
          </div>
        </div>
      </div>

      <div className="mt-8 border-t border-border/50 pt-4">
        <Button
          asChild
          className="h-11 w-full rounded-full bg-primary text-sm font-semibold text-primary-foreground shadow-md transition-transform hover:bg-primary/90 active:scale-[0.99]"
        >
          <Link href={actionHref}>
            <span>{buttonText}</span>
            <HugeiconsIcon icon={ArrowRight01Icon} size={18} className="ml-2" />
          </Link>
        </Button>
      </div>
    </article>
  );
}
