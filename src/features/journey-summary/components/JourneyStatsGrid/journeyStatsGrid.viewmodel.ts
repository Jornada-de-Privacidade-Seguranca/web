import type {
  JourneyStatsGridProps,
  JourneyStatsGridViewModelReturn,
} from "./journeyStatsGrid.types";

export function useJourneyStatsGridVM(
  props: JourneyStatsGridProps
): JourneyStatsGridViewModelReturn {
  const { journey, labels } = props;

  const { stepsCount, completedStepsCount, status } = journey;

  // Jornada não iniciada mostra só o total de etapas; em andamento ou
  // concluída, mostra o progresso ("2 de 6")
  const showProgress = status !== "not_started";

  const stats: JourneyStatsGridViewModelReturn["stats"] = [
    {
      key: "steps",
      value: showProgress
        ? labels.stepsProgressText(completedStepsCount, stepsCount)
        : String(stepsCount),
      label: labels.stepsCountLabel,
      ariaLabel: showProgress
        ? labels.stepsProgressAriaLabel(completedStepsCount, stepsCount)
        : labels.stepsCountAriaLabel(stepsCount),
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
