import type { QuickActionItem } from "../../painel.types";

export interface QuickActionsProps {
  title: string;
  sectionAriaLabel: string;
  actions: QuickActionItem[];
}

export interface QuickActionsViewModelReturn {
  title: string;
  sectionAriaLabel: string;
  actions: QuickActionItem[];
}

