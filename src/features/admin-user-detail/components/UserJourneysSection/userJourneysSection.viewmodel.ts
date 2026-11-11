import type {
  UserJourneysSectionProps,
  UserJourneysSectionViewModelReturn,
} from "./userJourneysSection.types";

export function useUserJourneysSectionVM(
  props: UserJourneysSectionProps
): UserJourneysSectionViewModelReturn {
  const { userId, journeys, labels } = props;

  return {
    journeys,
    allResultsHref: `/admin/resultados?userId=${userId}`,
    labels,
    hasJourneys: journeys.length > 0,
  };
}
