"use client";

import { FilterRemoveIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Button } from "@/components/ui";
import { useResultsFilterPanelVM } from "./resultsFilterPanel.viewmodel";
import type { ResultsFilterPanelProps } from "./resultsFilterPanel.types";

export function ResultsFilterPanel(props: ResultsFilterPanelProps) {
  const {
    isOpen,
    domainOptions,
    panelTitle,
    domainTitle,
    clearLabel,
    hasActiveFilters,
    onToggleDomain,
    onClearFilters,
  } = useResultsFilterPanelVM(props);

  if (!isOpen) return null;

  return (
    <div
      role="region"
      aria-label={panelTitle}
      className="rounded-3xl border border-border/70 bg-card/95 p-6 shadow-md backdrop-blur-md animate-in fade-in-50 duration-200 space-y-4"
    >
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-border/50">
        <h3 className="font-heading text-base font-bold text-foreground">
          {panelTitle}
        </h3>
        {hasActiveFilters && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onClearFilters}
            className="text-xs text-muted-foreground hover:text-foreground h-8 px-2.5"
          >
            <HugeiconsIcon icon={FilterRemoveIcon} size={14} className="mr-1.5" />
            {clearLabel}
          </Button>
        )}
      </div>

      <div className="space-y-3">
        <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
          {domainTitle}
        </h4>
        <div className="flex flex-wrap gap-2">
          {domainOptions.map((opt) => (
            <button
              key={opt.id}
              type="button"
              onClick={() => onToggleDomain(opt.id)}
              aria-pressed={opt.isSelected}
              className={`inline-flex items-center rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all ${
                opt.isSelected
                  ? "bg-primary text-primary-foreground shadow-sm ring-1 ring-primary"
                  : "bg-muted/70 text-muted-foreground hover:bg-muted hover:text-foreground ring-1 ring-border/50"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export * from "./resultsFilterPanel.types";
