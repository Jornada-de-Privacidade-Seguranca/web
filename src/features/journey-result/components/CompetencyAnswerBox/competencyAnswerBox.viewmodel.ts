import type {
  CompetencyAnswerBoxProps,
  CompetencyAnswerBoxViewModelReturn,
} from "./competencyAnswerBox.types";

export function useCompetencyAnswerBoxVM(
  props: CompetencyAnswerBoxProps
): CompetencyAnswerBoxViewModelReturn {
  return {
    ...props,
    isDeclared: props.variant === "declared",
    isEmpty: props.groups.length === 0,
  };
}
