import {
  getCompetenciesAreaUrl,
  getJourneySummaryUrl,
  getCurrentJourneyStepUrl,
  type PreQuestionnaireStepSlug,
} from "@/shared/utils/journeyRoutes";
import type {
  CurrentJourneyCardProps,
  CurrentJourneyCardViewModelReturn,
} from "./currentJourneyCard.types";

export function useCurrentJourneyCardVM(
  props: CurrentJourneyCardProps
): CurrentJourneyCardViewModelReturn {
  const { journey } = props;

  let actionHref = "/jornadas";

  if (journey) {
    if (journey.status === "pending") {
      actionHref = getJourneySummaryUrl(journey.id || "atual");
    } else if (journey.currentStep && journey.currentStep !== "competencias") {
      actionHref = getCurrentJourneyStepUrl(
        journey.currentStep as PreQuestionnaireStepSlug
      );
    } else {
      actionHref = getCompetenciesAreaUrl(0);
    }
  }

  const progressPercent = Math.min(
    100,
    Math.max(0, journey?.progressPercent ?? (journey?.status === "in_progress" ? 50 : 10))
  );

  const progressPercentText = props.progressPercentLabel.replace(
    "{percent}",
    String(progressPercent)
  );

  const progressAriaLabel = `${props.progressLabel}: ${progressPercentText}`;

  return {
    journey,
    sectionTitle: props.sectionTitle,
    emptyMessage: props.emptyMessage,
    exploreCtaText: props.exploreCtaText,
    continueCtaText: props.continueCtaText,
    progressPercent,
    progressPercentText,
    progressAriaLabel,
    actionHref,
    badgeLabel: props.badgeLabel,
    badgeVariant: props.badgeVariant,
  };
}
