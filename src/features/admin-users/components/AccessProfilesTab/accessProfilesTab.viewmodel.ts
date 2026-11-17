import type {
  AccessProfilesTabProps,
  AccessProfilesTabViewModelReturn,
} from "./accessProfilesTab.types";

const noop = () => {};

export function useAccessProfilesTabVM(
  props: AccessProfilesTabProps
): AccessProfilesTabViewModelReturn {
  const { profiles, labels, isLoading = false, isError = false, onRetry = noop } = props;

  return {
    profiles,
    labels,
    isLoading,
    isError,
    onRetry,
  };
}
