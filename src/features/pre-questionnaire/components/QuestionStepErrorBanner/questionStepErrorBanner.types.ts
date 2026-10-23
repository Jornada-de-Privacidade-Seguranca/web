export interface QuestionStepErrorBannerProps {
  message: string | null;
  /** Botão de nova tentativa (exibido quando onRetry é informado) */
  retryLabel?: string;
  onRetry?: () => void;
  /** Link opcional, para quando o erro se resolve em outra tela */
  linkLabel?: string;
  linkHref?: string;
}

export type QuestionStepErrorBannerViewModelReturn =
  QuestionStepErrorBannerProps;
