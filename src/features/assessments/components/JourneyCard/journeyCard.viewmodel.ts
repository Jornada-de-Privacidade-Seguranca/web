import type { JourneyCardProps } from "./journeyCard.types";

export function useJourneyCardVM(props: JourneyCardProps) {
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

  const questionsText = labels.questionsCount(journey.totalQuestions);
  const timeText = labels.estimatedMinutes(journey.estimatedMinutes);

  const badgeText = isCompleted
    ? labels.statusCompleted
    : isInProgress
    ? labels.statusInProgress
    : labels.statusNotStarted;

  const ctaAriaLabel = `${buttonText} — ${journey.title}`;

  return {
    journey,
    isCompleted,
    isInProgress,
    isNotStarted,
    actionHref,
    buttonText,
    buttonVariant,
    badgeText,
    questionsText,
    timeText,
    ctaAriaLabel,
  };
}
