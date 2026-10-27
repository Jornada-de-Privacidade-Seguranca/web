export interface JourneyResultErrorStateProps {
  title: string;
  message: string;
  linkText: string;
  linkHref: string;
  /** Texto do botão de nova tentativa; sem ele, o botão não é exibido */
  retryLabel?: string | null;
  onRetry?: () => void;
}

export interface JourneyResultErrorStateViewModelReturn
  extends Omit<JourneyResultErrorStateProps, "retryLabel" | "onRetry"> {
  canRetry: boolean;
  retryLabel: string;
  handleRetry: () => void;
}
