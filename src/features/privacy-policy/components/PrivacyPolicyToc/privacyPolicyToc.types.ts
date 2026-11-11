import type { PrivacyPolicySection } from "../../privacyPolicy.types";

export interface PrivacyPolicyTocProps {
  title: string;
  sections: Pick<PrivacyPolicySection, "id" | "number" | "title">[];
}

export type PrivacyPolicyTocViewModelReturn = PrivacyPolicyTocProps;

