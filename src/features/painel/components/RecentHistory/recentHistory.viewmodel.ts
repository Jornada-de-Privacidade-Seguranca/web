import { useFormatter } from "next-intl";
import type {
  RecentHistoryProps,
  RecentHistoryViewModelReturn,
  FormattedHistoryItem,
} from "./recentHistory.types";

export function useRecentHistoryVM(
  props: RecentHistoryProps
): RecentHistoryViewModelReturn {
  const { history, emptyMessage, sectionTitle = "Histórico recente" } = props;
  const format = useFormatter();

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

    const progressPercent = Math.min(100, Math.max(0, item.score));

    return {
      ...item,
      formattedDate,
      progressPercent,
    };
  });

  return {
    history: formattedItems,
    emptyMessage,
    sectionTitle,
    hasHistory: history.length > 0,
  };
}
