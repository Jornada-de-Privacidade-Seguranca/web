"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import {
  CheckListIcon,
  Clock01Icon,
  Layers01Icon,
  Shield01Icon,
} from "@hugeicons/core-free-icons";
import { useJourneyStatsGridVM } from "./journeyStatsGrid.viewmodel";
import type { JourneyStatsGridProps } from "./journeyStatsGrid.types";

const STAT_ICONS = [CheckListIcon, Clock01Icon, Layers01Icon, Shield01Icon];

export function JourneyStatsGrid(props: JourneyStatsGridProps) {
  const { stats } = useJourneyStatsGridVM(props);

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
      {stats.map((stat, index) => (
        <div
          key={stat.label}
          aria-label={stat.ariaLabel}
          className="flex flex-col gap-2 rounded-2xl border border-border/60 bg-muted/30 p-4"
        >
          <HugeiconsIcon icon={STAT_ICONS[index]} size={20} className="text-primary" />
          <span aria-hidden="true" className="text-2xl font-bold text-card-foreground">
            {stat.value}
          </span>
          <span
            aria-hidden="true"
            className="text-[0.68rem] font-bold uppercase tracking-[0.12em] text-muted-foreground"
          >
            {stat.label}
          </span>
        </div>
      ))}
    </div>
  );
}
