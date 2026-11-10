import type { HistoryItem } from "../../painel.types";

export interface FormattedHistoryItem extends HistoryItem {
  formattedDate: string;
  ariaLabel: string;
  resultHref: string;
}

export interface RecentHistoryProps {
  history: HistoryItem[];
  emptyMessage: string;
  sectionTitle?: string;
}

export interface RecentHistoryViewModelReturn {
  history: FormattedHistoryItem[];
  emptyMessage: string;
  sectionTitle: string;
  hasHistory: boolean;
  viewResultText: string;
}
