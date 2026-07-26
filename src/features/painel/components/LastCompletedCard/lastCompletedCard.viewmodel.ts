import { useFormatter, useTranslations } from "next-intl";
import type {
  LastCompletedCardProps,
  LastCompletedCardViewModelReturn,
} from "./lastCompletedCard.types";

export function useLastCompletedCardVM(
  props: LastCompletedCardProps
): LastCompletedCardViewModelReturn {
  const { assessment, emptyMessage } = props;
  const format = useFormatter();
  const t = useTranslations("painel");

  let formattedDate = "";
  if (assessment?.completedAt) {
    try {
      const date = new Date(assessment.completedAt);
      formattedDate = format.dateTime(date, {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
    } catch {
      formattedDate = assessment.completedAt;
    }
  }

  const resultHref = assessment ? `/resultados/${assessment.id}` : "#";

  return {
    assessment,
    emptyMessage,
    formattedDate,
    resultHref,
    lastCompletionLabel: t("lastCompletionLabel"),
    scoreLabel: t("scoreLabel"),
    viewResultText: t("viewResult"),
  };
}
