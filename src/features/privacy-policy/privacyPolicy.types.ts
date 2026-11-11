import type { Shield01Icon } from "@hugeicons/core-free-icons";

export type PrivacyPolicyIcon = typeof Shield01Icon;

export interface PrivacyPolicySection {
  id: string;
  number: string;
  icon: PrivacyPolicyIcon;
  title: string;
  paragraphs: string[];
  bullets?: string[];
}

export interface PrivacyPolicyLabels {
  brand: string;
  eyebrow: string;
  title: string;
  subtitle: string;
  lastUpdatedLabel: string;
  lastUpdatedDate: string;
  tocTitle: string;
  backLinkLabel: string;
  primaryCtaLabel: string;
  footerLeft: string;
  footerRight: string;
}

export interface PrivacyPolicyViewModelReturn {
  labels: PrivacyPolicyLabels;
  sections: PrivacyPolicySection[];
  backHref: string;
  primaryCtaHref: string;
}

