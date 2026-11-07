import type { AdminUserDetailLabels } from "../../adminUserDetail.types";

export interface InactiveUserBannerProps {
  isVisible: boolean;
  labels: AdminUserDetailLabels;
  onActivateNow: () => void;
  onDismiss: () => void;
  onDontShowAgain: () => void;
}

export interface InactiveUserBannerViewModelReturn {
  isVisible: boolean;
  title: string;
  description: string;
  activateNowText: string;
  dismissText: string;
  dontShowAgainText: string;
  onActivateNow: () => void;
  onDismiss: () => void;
  onDontShowAgain: () => void;
}
