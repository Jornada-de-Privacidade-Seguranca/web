import type {
  DifficultyBadgeProps,
  DifficultyBadgeViewModelReturn,
} from "./difficultyBadge.types";

const COLOR_BY_LEVEL = {
  beginner: "bg-slate-500/15 text-slate-600 ring-slate-500/25 dark:text-slate-300",
  basic: "bg-emerald-500/15 text-emerald-600 ring-emerald-500/25 dark:text-emerald-400",
  intermediate: "bg-amber-500/15 text-amber-700 ring-amber-500/25 dark:text-amber-300",
  advanced: "bg-orange-500/15 text-orange-600 ring-orange-500/25 dark:text-orange-400",
  specialist: "bg-red-500/15 text-red-600 ring-red-500/25 dark:text-red-400",
} as const;

const NEUTRAL_COLOR = "bg-muted text-muted-foreground ring-border";

export function useDifficultyBadgeVM(props: DifficultyBadgeProps): DifficultyBadgeViewModelReturn {
  return {
    label: props.label,
    srPrefix: props.srPrefix,
    colorClassName: props.level ? COLOR_BY_LEVEL[props.level] : NEUTRAL_COLOR,
    className: props.className,
  };
}
