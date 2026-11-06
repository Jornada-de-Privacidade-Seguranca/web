import type {
  QuestionStepSkeletonProps,
  QuestionStepSkeletonViewModelReturn,
} from "./questionStepSkeleton.types";

export function useQuestionStepSkeletonVM({
  loadingLabel,
  optionCount,
  testId,
}: QuestionStepSkeletonProps): QuestionStepSkeletonViewModelReturn {
  const optionPlaceholders = Array.from({ length: optionCount }, (_, i) => i);

  return { loadingLabel, testId, optionPlaceholders };
}
