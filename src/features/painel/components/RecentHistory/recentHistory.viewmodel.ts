import { useFormatter, useTranslations } from "next-intl";
import { getJourneyResultUrl } from "@shared/utils/journeyRoutes";
import type {
  RecentHistoryProps,
  RecentHistoryViewModelReturn,
  FormattedHistoryItem,
} from "./recentHistory.types";

export function useRecentHistoryVM(
  props: RecentHistoryProps,
): RecentHistoryViewModelReturn {
  const t = useTranslations("painel");
  const format = useFormatter();

  const {
    history,
    emptyMessage,
    sectionTitle = t("historySectionTitle"),
  } = props;

  const formattedItems: FormattedHistoryItem[] = history.map((item) => {
    let formattedDate = "";
    if (item.completedAt) {
      try {
        const date = new Date(item.completedAt);
        formattedDate = format.dateTime(date, {
          day: "numeric",
          month: "short",
          year: "numeric",
        });
      } catch {
        formattedDate = item.completedAt;
      }
    }

    const ariaLabel = t("progressBarAriaLabel", { title: item.title });

    return {
      ...item,
      formattedDate,
      ariaLabel,
      resultHref: getJourneyResultUrl(item.id),
    };
  });

  return {
    history: formattedItems,
    emptyMessage,
    sectionTitle,
    hasHistory: history.length > 0,
    viewResultText: t("viewResult"),
  };
}
