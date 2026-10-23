"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import { Cancel01Icon } from "@hugeicons/core-free-icons";
import { useAreaProgressHeaderVM } from "./areaProgressHeader.viewmodel";
import type { AreaProgressHeaderProps } from "./areaProgressHeader.types";

/**
 * Barra superior do questionário: "Sair", indicador da área e progresso geral.
 * Substitui a tag da etapa usada no cabeçalho das demais etapas da jornada.
 */
export function AreaProgressHeader(props: AreaProgressHeaderProps) {
  const { areaIndicator, clampedPercent, progressAriaLabel, onExit, exitLabel, exitAriaLabel } =
    useAreaProgressHeaderVM(props);

  return (
    <header className="sticky top-0 z-20 flex h-16 shrink-0 items-center border-b border-border/60 bg-background/80 px-4 backdrop-blur md:px-8">
      <div className="flex min-w-0 flex-1 items-center gap-4">
        <button
          type="button"
          onClick={onExit}
          aria-label={exitAriaLabel}
          className="inline-flex shrink-0 cursor-pointer items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
        >
          <HugeiconsIcon icon={Cancel01Icon} size={16} />
          <span>{exitLabel}</span>
        </button>

        <div className="hidden h-5 w-px shrink-0 bg-border/60 sm:block" />

        <div className="flex min-w-0 flex-1 flex-col gap-1.5">
          <div className="flex items-center justify-between gap-3 text-xs text-muted-foreground">
            <span className="truncate">{areaIndicator}</span>
            <span className="tabular-nums" aria-hidden="true">
              {clampedPercent}%
            </span>
          </div>
          <div
            role="progressbar"
            aria-label={progressAriaLabel}
            aria-valuenow={clampedPercent}
            aria-valuemin={0}
            aria-valuemax={100}
            className="h-1.5 overflow-hidden rounded-full bg-muted"
          >
            <div
              className="h-full rounded-full bg-primary transition-[width] duration-500 ease-out"
              style={{ width: `${clampedPercent}%` }}
            />
          </div>
        </div>
      </div>
    </header>
  );
}

export * from "./areaProgressHeader.types";
