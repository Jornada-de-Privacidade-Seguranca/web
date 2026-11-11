import type { PrivacyPolicySection } from "../../privacyPolicy.types";

export interface PrivacyPolicySectionCardProps {
  section: PrivacyPolicySection;
}

export interface PrivacyPolicySectionCardViewModelReturn {
  id: string;
  headingId: string;
  number: string;
  icon: PrivacyPolicySection["icon"];
  title: string;
  paragraphs: string[];
  bullets: string[];
  hasBullets: boolean;
}

