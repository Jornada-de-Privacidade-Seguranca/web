import type {
  SingleChoiceQuestionStepProps,
  SingleChoiceQuestionStepViewModelReturn,
} from "./singleChoiceQuestionStep.types";

export function useSingleChoiceQuestionStepVM<T extends string = string>(
  props: SingleChoiceQuestionStepProps<T>
): SingleChoiceQuestionStepViewModelReturn<T> {
  const canContinue =
    Boolean(props.selectedOption) &&
    !props.isSubmitting &&
    !props.isContinueDisabled;

  return {
    ...props,
    canContinue,
  };
}
