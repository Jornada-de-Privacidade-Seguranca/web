import type {
  ProfessionalProfileSummaryProps,
  ProfessionalProfileSummaryViewModelReturn,
} from "./professionalProfileSummary.types";

export function useProfessionalProfileSummaryVM(
  props: ProfessionalProfileSummaryProps
): ProfessionalProfileSummaryViewModelReturn {
  return {
    ...props,
    hasCourses: props.profile.courseGroups.some((group) => group.courses.length > 0),
    hasCertifications: props.profile.certifications.length > 0,
  };
}
