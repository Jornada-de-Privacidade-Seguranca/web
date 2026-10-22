import type {
  MultiSelectSearchStepProps,
  MultiSelectSearchStepViewModelReturn,
} from "./multiSelectSearchStep.types";

export function useMultiSelectSearchStepVM(
  props: MultiSelectSearchStepProps
): MultiSelectSearchStepViewModelReturn {
  // Permite que legendas longas separadas por "/" quebrem na barra, não no meio da palavra
  const groups = props.groups?.map((group) => ({
    ...group,
    label: group.label.replace(/\//g, "/​"),
  }));
  const hasGroups = Boolean(groups && groups.length > 0);
  const selectedIds = new Set(props.selectedItems.map((item) => item.id));
  // Continuar sem seleção é permitido; o botão só trava durante o salvamento
  // ou quando a etapa indicar que ainda não é seguro salvar
  const canContinue = !props.isSubmitting && !props.isContinueDisabled;

  return {
    ...props,
    groups,
    hasGroups,
    selectedIds,
    canContinue,
  };
}
