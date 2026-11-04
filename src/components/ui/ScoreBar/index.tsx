"use client";

import { useId } from "react";
import { cn } from "@/shared/lib/utils";
import { useScoreBarVM } from "./scoreBar.viewmodel";
import type { ScoreBarProps } from "./scoreBar.types";

/**
 * Barra de nota de 0 a 100, na cor da faixa e com o rótulo visível ao lado da
 * cor (ex.: "Forte 78/100"). O marcador opcional é descrito para o leitor de
 * tela pela descrição da barra.
 */
export function ScoreBar(props: ScoreBarProps) {
  const {
    value,
    text,
    ariaLabel,
    textClassName,
    fillClassName,
    markerPosition,
    markerAriaLabel,
    className,
  } = useScoreBarVM(props);
  const markerDescriptionId = useId();

  return (
    <div data-testid="score-bar" className={cn("w-full min-w-0 space-y-2", className)}>
      <p aria-hidden="true" className={cn("text-sm font-semibold tabular-nums", textClassName)}>
        {text}
      </p>
      <div
        role="progressbar"
        aria-label={ariaLabel}
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuetext={text}
        aria-describedby={markerAriaLabel ? markerDescriptionId : undefined}
        className="relative h-2 rounded-full bg-muted-foreground/20"
      >
        <div
          className={cn("h-full rounded-full transition-[width] duration-500 motion-reduce:transition-none", fillClassName)}
          style={{ width: `${value}%` }}
        />
        {markerPosition !== null && (
          <span
            aria-hidden="true"
            data-testid="score-bar-marker"
            className="absolute -top-1 h-4 w-0.5 -translate-x-1/2 rounded-full bg-destructive"
            style={{ left: `${markerPosition}%` }}
          />
        )}
      </div>
      {markerAriaLabel && (
        <span id={markerDescriptionId} className="sr-only">
          {markerAriaLabel}
        </span>
      )}
    </div>
  );
}

export * from "./scoreBar.types";
