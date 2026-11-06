"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import {
  Clock01Icon,
  Layers01Icon,
  Shield01Icon,
} from "@hugeicons/core-free-icons";
import { useJourneyStatsGridVM } from "./journeyStatsGrid.viewmodel";
import type { JourneyStatsGridProps } from "./journeyStatsGrid.types";

import type { StatKey } from "./journeyStatsGrid.types";

const STAT_ICONS: Record<
  StatKey,
  typeof Clock01Icon | typeof Layers01Icon | typeof Shield01Icon
> = {
  duration: Clock01Icon,
  areas: Layers01Icon,
  competencies: Shield01Icon,
};

export function JourneyStatsGrid(props: JourneyStatsGridProps) {
  const { stats } = useJourneyStatsGridVM(props);

  return (
    // auto-fit: as caixas quebram para uma nova linha conforme a largura
    // disponível no conteúdo (que desconta a sidebar), não a da janela
    <div className="grid grid-cols-[repeat(auto-fit,minmax(min(8.5rem,100%),1fr))] gap-4">
      {stats.map((stat) => (
        <div
          key={stat.key}
          role="group"
          aria-label={stat.ariaLabel}
          title={stat.ariaLabel}
          className="flex min-w-0 flex-col gap-2 rounded-2xl border border-border/60 bg-muted/30 p-4"
        >
          <HugeiconsIcon icon={STAT_ICONS[stat.key]} size={20} className="shrink-0 text-primary" />
          <span
            aria-hidden="true"
            className="truncate text-2xl font-bold text-card-foreground"
          >
            {stat.value}
          </span>
          <span
            aria-hidden="true"
            className="truncate text-[0.68rem] font-bold uppercase tracking-[0.12em] text-muted-foreground"
          >
            {stat.label}
          </span>
        </div>
      ))}
    </div>
  );
}
