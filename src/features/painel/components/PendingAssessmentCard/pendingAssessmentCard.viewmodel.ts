import { useTranslations } from "next-intl";
import type {
  PendingAssessmentCardProps,
  PendingAssessmentCardViewModelReturn,
} from "./pendingAssessmentCard.types";

export function usePendingAssessmentCardVM(
  props: PendingAssessmentCardProps
): PendingAssessmentCardViewModelReturn {
  const { assessment, emptyMessage } = props;
  const t = useTranslations("painel");

  const isPending = assessment?.status === "pending";
  const badgeLabel = isPending ? t("badgePending") : t("badgeInProgress");
  const badgeVariant = isPending ? "pending" : "in_progress";
  const buttonText = isPending ? t("startAssessment") : t("continueAssessment");
  const actionHref = assessment ? `/jornadas/${assessment.id}` : "#";
  const questionsText = assessment
    ? t("questionsCount", { count: assessment.totalQuestions })
    : "";
  const timeText = assessment
    ? t("estimatedMinutesText", { minutes: assessment.estimatedMinutes })
    : "";

  return {
    assessment,
    emptyMessage,
    badgeLabel,
    badgeVariant,
    buttonText,
    actionHref,
    questionsText,
    timeText,
  };
}
