import type { ProfessionalProfileSummary } from "@features/journey-result/journeyResult.types";

export interface ProfessionalProfileSummaryProps {
  profile: ProfessionalProfileSummary;
  labels: {
    eyebrow: string;
    title: string;
    coursesTitle: string;
    certificationsTitle: string;
    noCourses: string;
    noCertifications: string;
  };
}

export interface ProfessionalProfileSummaryViewModelReturn extends ProfessionalProfileSummaryProps {
  hasCourses: boolean;
  hasCertifications: boolean;
}
