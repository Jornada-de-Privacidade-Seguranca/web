export interface QuestionStepErrorBannerProps {
  message: string | null;
  retryLabel: string;
  onRetry: () => void;
}

export type QuestionStepErrorBannerViewModelReturn =
  QuestionStepErrorBannerProps;
