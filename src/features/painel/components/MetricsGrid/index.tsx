"use client";

import {
  CheckmarkCircle02Icon,
  Clock01Icon,
  ChartHistogramIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useMetricsGridVM } from "./metricsGrid.viewmodel";
import type { MetricsGridProps } from "./metricsGrid.types";

const ICONS_BY_NAME = {
  completed: CheckmarkCircle02Icon,
  pending: Clock01Icon,
  score: ChartHistogramIcon,
};

const COLORS_BY_NAME = {
  completed:
    "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 ring-1 ring-emerald-500/20",
  pending:
    "bg-amber-500/10 text-amber-600 dark:text-amber-400 ring-1 ring-amber-500/20",
  score:
    "bg-primary/10 text-primary ring-1 ring-primary/20",
};

export function MetricsGrid(props: MetricsGridProps) {
  const { sectionTitle, sectionAriaLabel, cards } = useMetricsGridVM(props);

  return (
    <section aria-label={sectionAriaLabel} className="space-y-4">
      <h2 className="text-lg font-bold tracking-tight text-foreground">
        {sectionTitle}
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {cards.map((card) => {
          const IconComponent = ICONS_BY_NAME[card.iconName];
          const colorClass = COLORS_BY_NAME[card.iconName];

          return (
            <article
              key={card.id}
              className="flex flex-col justify-between rounded-2xl border border-border/60 bg-card p-5 shadow-sm transition-all hover:border-border"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {card.title}
                </span>
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-lg ${colorClass}`}
                >
                  <HugeiconsIcon icon={IconComponent} size={16} />
                </div>
              </div>

              <div className="mt-4 flex items-baseline gap-1.5">
                <span className="text-3xl font-extrabold tracking-tight text-foreground">
                  {card.value}
                </span>
                {card.suffix && (
                  <span className="text-sm font-medium text-muted-foreground">
                    {card.suffix}
                  </span>
                )}
              </div>

              <p className="mt-1 text-xs text-muted-foreground">
                {card.subtitle}
              </p>
            </article>
          );
        })}
      </div>
    </section>
  );
}

