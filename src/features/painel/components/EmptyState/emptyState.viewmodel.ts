import type { EmptyStateProps, EmptyStateViewModelReturn } from "./emptyState.types";

export function useEmptyStateVM(props: EmptyStateProps): EmptyStateViewModelReturn {
  return {
    message: props.message,
    className: props.className,
  };
}
