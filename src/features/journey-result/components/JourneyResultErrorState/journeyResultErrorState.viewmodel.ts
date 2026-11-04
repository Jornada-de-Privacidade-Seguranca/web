import type {
  JourneyResultErrorStateProps,
  JourneyResultErrorStateViewModelReturn,
} from "./journeyResultErrorState.types";

export function useJourneyResultErrorStateVM(
  props: JourneyResultErrorStateProps
): JourneyResultErrorStateViewModelReturn {
  const { retryLabel, onRetry, ...rest } = props;

  return {
    ...rest,
    canRetry: Boolean(retryLabel && onRetry),
    retryLabel: retryLabel ?? "",
    handleRetry: () => onRetry?.(),
  };
}
