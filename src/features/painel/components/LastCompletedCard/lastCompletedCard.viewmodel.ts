import { useFormatter, useTranslations } from "next-intl";
import { getJourneyResultUrl } from "@shared/utils/journeyRoutes";
import type {
  LastCompletedCardProps,
  LastCompletedCardViewModelReturn,
} from "./lastCompletedCard.types";

export function useLastCompletedCardVM(
  props: LastCompletedCardProps
): LastCompletedCardViewModelReturn {
  const { assessment, emptyMessage, sectionTitle, viewAllResultsText } = props;
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

  const resultHref = assessment ? getJourneyResultUrl(assessment.id) : "#";
  const allResultsHref = "/resultados";

  return {
    assessment,
    emptyMessage,
    sectionTitle: sectionTitle || t("completedSectionTitle"),
    formattedDate,
    resultHref,
    allResultsHref,
    lastCompletionLabel: t("lastCompletionLabel"),
    scoreLabel: t("scoreLabel"),
    viewResultText: t("viewResult"),
    viewAllResultsText: viewAllResultsText || t("viewAllResults"),
  };
}
