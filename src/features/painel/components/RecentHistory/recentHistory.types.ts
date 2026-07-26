import type { HistoryItem } from "../../painel.types";

export interface FormattedHistoryItem extends HistoryItem {
  formattedDate: string;
  progressPercent: number;
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
}
