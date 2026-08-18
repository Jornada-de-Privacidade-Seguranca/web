import type {
  Journey,
  AssessmentsLabels,
} from "@features/assessments/assessments.types";

export interface JourneyCardProps {
  journey: Journey;
  labels: AssessmentsLabels;
}
