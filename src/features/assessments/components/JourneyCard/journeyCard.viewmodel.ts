import type { JourneyCardProps, JourneyCardViewModelReturn } from "./journeyCard.types";

export function useJourneyCardVM(props: JourneyCardProps): JourneyCardViewModelReturn {
  const { journey, labels } = props;

  const isCompleted = journey.status === "completed";
  const isInProgress = journey.status === "in_progress";
  const isNotStarted = journey.status === "not_started";

  const actionHref = journey.href ?? `/jornada/${journey.id}`;

  const buttonText = isCompleted
    ? labels.actionRetake
    : isInProgress
    ? labels.actionContinue
    : labels.actionStart;

  const buttonVariant: "outline" | "default" = isCompleted ? "outline" : "default";

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

  const hasMeta = competenciesText !== null || timeText !== null;

  const badgeText = isCompleted
    ? journey.score != null
      ? labels.completedScoreBadge(journey.score)
      : labels.statusCompleted
    : isInProgress
    ? labels.statusInProgress
    : labels.statusNotStarted;

  const ctaAriaLabel = journey.title
    ? `${buttonText} — ${journey.title}`
    : buttonText;

  return {
    journey,
    isCompleted,
    isInProgress,
    isNotStarted,
    domainLabel,
    actionHref,
    buttonText,
    buttonVariant,
    badgeText,
    competenciesText,
    timeText,
    hasMeta,
    ctaAriaLabel,
  };
}
