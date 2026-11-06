import type {
  InactiveUserBannerProps,
  InactiveUserBannerViewModelReturn,
} from "./inactiveUserBanner.types";

export function useInactiveUserBannerVM(
  props: InactiveUserBannerProps
): InactiveUserBannerViewModelReturn {
  const { isVisible, labels, onActivateNow, onDismiss, onDontShowAgain } =
    props;

  return {
    isVisible,
    title: labels.bannerTitle,
    description: labels.bannerDescription,
    activateNowText: labels.bannerActivateNow,
    dismissText: labels.bannerDismiss,
    dontShowAgainText: labels.bannerDontShowAgain,
    onActivateNow,
    onDismiss,
    onDontShowAgain,
  };
}
