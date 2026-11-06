import { getCompetenciesAreaUrl, getProfileSummaryUrl } from "@/shared/utils/journeyRoutes";
import type {
  PendingJourneyCardProps,
  PendingJourneyCardViewModelReturn,
} from "./pendingJourneyCard.types";

export function usePendingJourneyCardVM(
  props: PendingJourneyCardProps
): PendingJourneyCardViewModelReturn {
  const { journey, labels, onCancelJourney } = props;

  const isAssigned = journey.origin === "assigned" || journey.isSelfStarted === false;

  const badgeText = isAssigned ? labels.assignedBadge : labels.inProgressBadge;
  const badgeVariant = isAssigned ? "assigned" : "in_progress";

  const buttonText = isAssigned ? labels.actionStart : labels.actionContinue;

  const actionHref = isAssigned
    ? getProfileSummaryUrl(journey.id)
    : journey.href ?? getCompetenciesAreaUrl(0);

  // Jornada iniciada pelo usuário pode ser cancelada; atribuída por admin/gestor NÃO pode
  const canCancel = !isAssigned && Boolean(onCancelJourney);

  const domainLabelsMap: Record<string, string> = {
    privacy: labels.filterDomainPrivacy,
    security: labels.filterDomainSecurity,
    joint: labels.filterDomainJoint,
  };

  const domainLabel =
    journey.domainLabel ||
    (journey.domain ? domainLabelsMap[journey.domain] : labels.filterDomainPrivacy) ||
    labels.filterDomainPrivacy;

  const competenciesText =
    journey.competenciesCount != null
      ? labels.competenciesCount(journey.competenciesCount)
      : journey.totalQuestions != null
      ? labels.questionsCount(journey.totalQuestions)
      : null;

  const timeText =
    journey.estimatedMinutes != null
      ? labels.estimatedMinutes(journey.estimatedMinutes)
      : null;

  return {
    journey,
    domainLabel,
    badgeText,
    badgeVariant,
    buttonText,
    actionHref,
    canCancel,
    cancelButtonText: labels.actionCancel,
    competenciesText,
    timeText,
    onCancelJourney,
  };
}
