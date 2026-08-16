import type { JourneyCardProps } from "./journeyCard.types";

export function useJourneyCardVM(props: JourneyCardProps) {
  const { journey, labels } = props;

  const isCompleted = journey.status === "completed";
  const isInProgress = journey.status === "in_progress";

  const actionHref = `/jornada/${journey.id}`;

  const buttonText = isCompleted
    ? labels.actionRetake
    : isInProgress
    ? labels.actionContinue
    : labels.actionStart;

  const buttonVariant: "outline" | "default" = isCompleted ? "outline" : "default";

  const questionsText = labels.questionsCount(journey.totalQuestions);
  const timeText = labels.estimatedMinutes(journey.estimatedMinutes);

  return {
    journey,
    isCompleted,
    isInProgress,
    actionHref,
    buttonText,
    buttonVariant,
    questionsText,
    timeText,
    completedTagText: labels.statusCompleted,
  };
}
