import type {
  WelcomeSummaryProps,
  WelcomeSummaryViewModelReturn,
} from "./welcomeSummary.types";

export function useWelcomeSummaryVM(
  props: WelcomeSummaryProps
): WelcomeSummaryViewModelReturn {
  return {
    userName: props.userName,
    userRole: props.userRole,
    organization: props.organization,
    greetingTitle: props.greetingTitle,
    greetingSubtitle: props.greetingSubtitle,
    organizationLabelText: props.organizationLabelText,
  };
}

