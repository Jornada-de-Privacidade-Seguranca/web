import type { DomainBadgeProps, DomainBadgeViewModelReturn } from "./domainBadge.types";

export function useDomainBadgeVM(props: DomainBadgeProps): DomainBadgeViewModelReturn {
  const label = props.label?.trim() ?? "";

  return {
    isVisible: label.length > 0,
    label,
    srPrefix: props.srPrefix,
    className: props.className,
  };
}
