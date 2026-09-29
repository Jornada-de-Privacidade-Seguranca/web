export interface QuestionStepSkeletonProps {
  loadingLabel: string;
  optionCount: number;
  testId?: string;
}

export interface QuestionStepSkeletonViewModelReturn {
  loadingLabel: string;
  testId?: string;
  optionPlaceholders: number[];
}
