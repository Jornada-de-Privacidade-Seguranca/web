import type {
  QuickActionsProps,
  QuickActionsViewModelReturn,
} from "./quickActions.types";

export function useQuickActionsVM(
  props: QuickActionsProps
): QuickActionsViewModelReturn {
  return {
    title: props.title,
    sectionAriaLabel: props.sectionAriaLabel,
    actions: props.actions,
  };
}

