"use client";

import { useQuestionStepErrorBannerVM } from "./questionStepErrorBanner.viewmodel";
import type { QuestionStepErrorBannerProps } from "./questionStepErrorBanner.types";

export function QuestionStepErrorBanner(props: QuestionStepErrorBannerProps) {
  const { message, retryLabel, onRetry } = useQuestionStepErrorBannerVM(props);

  if (!message) return null;

  return (
    <div
      role="alert"
      className="fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-2xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive shadow-lg backdrop-blur"
    >
      <span>{message}</span>
      <button
        type="button"
        onClick={onRetry}
        className="font-bold underline cursor-pointer"
      >
        {retryLabel}
      </button>
    </div>
  );
}
