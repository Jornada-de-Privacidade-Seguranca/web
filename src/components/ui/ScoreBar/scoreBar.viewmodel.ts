import { normalizeScore } from "@shared/utils/scoreBand";
import type { ScoreBarProps, ScoreBarViewModelReturn } from "./scoreBar.types";

const COLOR_BY_BAND = {
  strong: { text: "text-emerald-600 dark:text-emerald-400", fill: "bg-emerald-500" },
  medium: { text: "text-amber-600 dark:text-amber-400", fill: "bg-amber-500" },
  weak: { text: "text-destructive", fill: "bg-destructive" },
} as const;

export function useScoreBarVM(props: ScoreBarProps): ScoreBarViewModelReturn {
  const value = normalizeScore(props.value);
  const colors = COLOR_BY_BAND[props.band];

  return {
    value,
    text: `${props.bandLabel} ${value}/100`,
    ariaLabel: props.ariaLabel,
    textClassName: colors.text,
    fillClassName: colors.fill,
    markerPosition: props.marker ? normalizeScore(props.marker.value) : null,
    markerAriaLabel: props.marker?.ariaLabel ?? null,
    className: props.className,
  };
}
