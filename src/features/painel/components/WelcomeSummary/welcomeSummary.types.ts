export interface WelcomeSummaryProps {
  userName: string;
  userRole: string;
  organization?: string | null;
  greetingTitle: string;
  greetingSubtitle: string;
  organizationLabelText: string;
}

export interface WelcomeSummaryViewModelReturn {
  userName: string;
  userRole: string;
  organization?: string | null;
  greetingTitle: string;
  greetingSubtitle: string;
  organizationLabelText: string;
}

