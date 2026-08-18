import type { EmptyStateProps } from "./emptyState.types";

export function useEmptyStateVM(props: EmptyStateProps) {
  return {
    message: props.message,
  };
}
