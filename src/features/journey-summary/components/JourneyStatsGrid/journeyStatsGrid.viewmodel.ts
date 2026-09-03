import type {
  JourneyStatsGridProps,
  JourneyStatsGridViewModelReturn,
} from "./journeyStatsGrid.types";

export function useJourneyStatsGridVM(
  props: JourneyStatsGridProps
): JourneyStatsGridViewModelReturn {
  const { journey, labels } = props;

  const stats = [
    {
      value: String(journey.questionsCount),
      label: labels.questionsLabel,
      ariaLabel: labels.questionsAriaLabel(journey.questionsCount),
    },
    {
      value: labels.estimatedMinutesText(journey.estimatedMinutes),
      label: labels.durationLabel,
      ariaLabel: labels.durationAriaLabel(journey.estimatedMinutes),
    },
    {
      value: String(journey.areasCount),
      label: labels.areasLabel,
      ariaLabel: labels.areasAriaLabel(journey.areasCount),
    },
    {
      value: String(journey.competenciesCount),
      label: labels.competenciesLabel,
      ariaLabel: labels.competenciesAriaLabel(journey.competenciesCount),
    },
  ];

  return { stats };
}
