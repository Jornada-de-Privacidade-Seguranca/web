import type React from "react";
import type { HugeiconsIcon } from "@hugeicons/react";

export interface MultiSelectGroup {
  id: string;
  label: string;
}

export interface MultiSelectItem {
  id: string;
  label: string;
  /** Linha secundária de texto (opcional) */
  description?: string;
}

export interface MultiSelectSelectedItem {
  id: string;
  label: string;
}

export interface MultiSelectSearchStepProps {
  /** Ícone exibido no badge ao lado do título da etapa */
  icon: React.ComponentProps<typeof HugeiconsIcon>["icon"];
  /** Tag do cabeçalho (ex: PRÉ-QUESTIONÁRIO · FORMAÇÃO ACADÊMICA) */
  stepTag?: string;
  /** Título da jornada exibido no cabeçalho */
  journeyTitle?: string;
  title: string;
  description?: string;
  searchTerm: string;
  onSearchChange: (term: string) => void;
  searchPlaceholder: string;
  /** Rótulo acessível do campo de busca */
  searchAriaLabel: string;
  /** Abas. Quando ausente ou vazio, a lista é exibida sem abas */
  groups?: MultiSelectGroup[];
  activeGroupId?: string;
  onGroupChange?: (id: string) => void;
  /** Rótulo acessível do grupo de abas */
  groupsAriaLabel?: string;
  /** Itens visíveis (aba ativa já filtrada pela busca) */
  items: MultiSelectItem[];
  /** Itens selecionados de todas as abas, exibidos como chips */
  selectedItems: MultiSelectSelectedItem[];
  onToggleItem: (id: string) => void;
  onRemoveItem: (id: string) => void;
  /** Rótulo acessível do botão de remover de cada chip */
  removeItemAriaLabel: (label: string) => string;
  emptyLabel: string;
  counterLabel: string;
  onContinue: () => void;
  onBack?: () => void;
  onExit: () => void;
  isSubmitting?: boolean;
  isContinueDisabled?: boolean;
  backLabel?: string;
  backAriaLabel?: string;
  continueLabel?: string;
  savingLabel?: string;
  exitLabel?: string;
  exitAriaLabel?: string;
}

export interface MultiSelectSearchStepViewModelReturn extends MultiSelectSearchStepProps {
  hasGroups: boolean;
  selectedIds: Set<string>;
  canContinue: boolean;
}
