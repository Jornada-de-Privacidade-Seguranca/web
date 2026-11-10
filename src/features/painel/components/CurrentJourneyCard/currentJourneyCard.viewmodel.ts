import {
  getCompetenciesAreaUrl,
  getJourneySummaryUrl,
} from "@/shared/utils/journeyRoutes";
import type {
  CurrentJourneyCardProps,
  CurrentJourneyCardViewModelReturn,
} from "./currentJourneyCard.types";

export function useCurrentJourneyCardVM(
  props: CurrentJourneyCardProps,
): CurrentJourneyCardViewModelReturn {
  const { journey } = props;
  const isStarted = journey?.status === "in_progress";

  // Iniciada, retoma as competências; ainda não iniciada, começa pelo resumo
  let actionHref = "/jornadas";
  if (journey) {
    actionHref = isStarted
      ? getCompetenciesAreaUrl(0)
      : getJourneySummaryUrl(journey.id);
  }

  return {
    journey,
    sectionTitle: props.sectionTitle,
    emptyMessage: props.emptyMessage,
    exploreCtaText: props.exploreCtaText,
    actionText: isStarted ? props.continueCtaText : props.startCtaText,
    actionHref,
    questionsText: props.questionsText,
    timeText: props.timeText,
    badgeLabel: props.badgeLabel,
    badgeVariant: props.badgeVariant,
  };
}
