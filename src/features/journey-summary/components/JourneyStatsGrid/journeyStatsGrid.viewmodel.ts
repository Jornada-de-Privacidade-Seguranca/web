import type {
  JourneyStatsGridProps,
  JourneyStatsGridViewModelReturn,
} from "./journeyStatsGrid.types";

export function useJourneyStatsGridVM(
  props: JourneyStatsGridProps
): JourneyStatsGridViewModelReturn {
  const { journey, labels } = props;

  // Dado ausente (ex.: resumo de um perfil, antes de a jornada existir) vira "—"
  const valueOrUnavailable = (
    data: number | null,
    label: string,
    format: (data: number) => { value: string; ariaLabel: string }
  ) =>
    data === null
      ? { value: labels.notAvailable, ariaLabel: labels.notAvailableAriaLabel(label) }
      : format(data);

  const stats: JourneyStatsGridViewModelReturn["stats"] = [
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
