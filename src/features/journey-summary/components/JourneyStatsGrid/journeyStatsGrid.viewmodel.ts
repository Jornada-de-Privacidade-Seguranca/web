import type {
  JourneyStatsGridProps,
  JourneyStatsGridViewModelReturn,
} from "./journeyStatsGrid.types";

export function useJourneyStatsGridVM(
  props: JourneyStatsGridProps
): JourneyStatsGridViewModelReturn {
  const { journey, labels } = props;

  const { stepsCount, completedStepsCount, status } = journey;

  // Dado ausente (ex.: resumo de um perfil, antes de a jornada existir) vira "—"
  const valueOrUnavailable = (
    data: number | null,
    label: string,
    format: (data: number) => { value: string; ariaLabel: string }
  ) =>
    data === null
      ? { value: labels.notAvailable, ariaLabel: labels.notAvailableAriaLabel(label) }
      : format(data);

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
      label: labels.durationLabel,
      ...valueOrUnavailable(journey.estimatedMinutes, labels.durationLabel, (minutes) => ({
        value: labels.estimatedMinutesText(minutes),
        ariaLabel: labels.durationAriaLabel(minutes),
      })),
    },
    {
      key: "areas",
      label: labels.areasLabel,
      ...valueOrUnavailable(journey.areasCount, labels.areasLabel, (count) => ({
        value: String(count),
        ariaLabel: labels.areasAriaLabel(count),
      })),
    },
    {
      key: "competencies",
      label: labels.competenciesLabel,
      ...valueOrUnavailable(journey.competenciesCount, labels.competenciesLabel, (count) => ({
        value: String(count),
        ariaLabel: labels.competenciesAriaLabel(count),
      })),
    },
  ];

  return { stats };
}
