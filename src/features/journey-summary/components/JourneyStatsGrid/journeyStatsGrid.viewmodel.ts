import type {
  JourneyStatsGridProps,
  JourneyStatsGridViewModelReturn,
} from "./journeyStatsGrid.types";

export function useJourneyStatsGridVM(
  props: JourneyStatsGridProps
): JourneyStatsGridViewModelReturn {
  const { journey, labels } = props;

  const stats: JourneyStatsGridViewModelReturn["stats"] = [
    {
      key: "questions",
      value: String(journey.questionsCount),
      label: labels.questionsLabel,
      ariaLabel: labels.questionsAriaLabel(journey.questionsCount),
    },
    {
      key: "duration",
      value: labels.estimatedMinutesText(journey.estimatedMinutes),
      label: labels.durationLabel,
      ariaLabel: labels.durationAriaLabel(journey.estimatedMinutes),
    },
    {
      key: "areas",
      value: String(journey.areasCount),
      label: labels.areasLabel,
      ariaLabel: labels.areasAriaLabel(journey.areasCount),
    },
    {
      key: "competencies",
      value: String(journey.competenciesCount),
      label: labels.competenciesLabel,
      ariaLabel: labels.competenciesAriaLabel(journey.competenciesCount),
    },
  ];

  return { stats };
}
