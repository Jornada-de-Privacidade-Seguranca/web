export interface PrivacyPolicyLabels {
  brand: string;
  title: string;
  subtitle: string;
  cardTitle: string;
  notice: string;
  backButton: string;
}

export interface PrivacyPolicySection {
  id: string;
  title: string;
  paragraphs: string[];
}

export interface PrivacyPolicyViewModelReturn {
  labels: PrivacyPolicyLabels;
  sections: PrivacyPolicySection[];
  handleBack: () => void;
  backHref: string;
}
