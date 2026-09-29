import type { HowItWorksStep } from "@features/journey-summary/journeySummary.types";

export interface HowItWorksSectionProps {
  title: string;
  subtitle: string;
  steps: HowItWorksStep[];
}

export type HowItWorksSectionViewModelReturn = HowItWorksSectionProps;
