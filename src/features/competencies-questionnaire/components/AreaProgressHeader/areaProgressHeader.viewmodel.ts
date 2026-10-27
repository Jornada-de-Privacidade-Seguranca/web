import type {
  AreaProgressHeaderProps,
  AreaProgressHeaderViewModelReturn,
} from "./areaProgressHeader.types";

export function useAreaProgressHeaderVM(
  props: AreaProgressHeaderProps
): AreaProgressHeaderViewModelReturn {
  return {
    ...props,
    clampedPercent: Math.min(100, Math.max(0, Math.round(props.progressPercent))),
  };
}
