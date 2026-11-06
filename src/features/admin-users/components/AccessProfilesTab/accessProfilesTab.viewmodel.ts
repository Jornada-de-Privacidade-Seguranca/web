import type {
  AccessProfilesTabProps,
  AccessProfilesTabViewModelReturn,
} from "./accessProfilesTab.types";

export function useAccessProfilesTabVM(
  props: AccessProfilesTabProps
): AccessProfilesTabViewModelReturn {
  const { profiles, labels, isLoading = false } = props;

  return {
    profiles,
    labels,
    isLoading,
  };
}
