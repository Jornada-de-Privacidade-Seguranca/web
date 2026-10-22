"use client";

import { useQuestionStepSkeletonVM } from "./questionStepSkeleton.viewmodel";
import type { QuestionStepSkeletonProps } from "./questionStepSkeleton.types";

export function QuestionStepSkeleton(props: QuestionStepSkeletonProps) {
  const { loadingLabel, testId, optionPlaceholders } =
    useQuestionStepSkeletonVM(props);

  return (
    <div
      role="status"
      aria-busy="true"
      aria-label={loadingLabel}
      data-testid={testId}
      className="flex min-h-full w-full flex-col bg-background"
    >
      <header className="h-16 shrink-0 border-b border-border/40 bg-background/50 animate-pulse" />
      <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col justify-center px-4 py-12 animate-pulse space-y-6">
        <div className="flex items-center gap-3">
          <div className="h-11 w-11 rounded-2xl bg-muted" />
          <div className="h-8 w-64 rounded-lg bg-muted" />
        </div>
        <div className="rounded-[2rem] border border-border/40 bg-card/60 p-8 space-y-4">
          <div className="h-6 w-48 rounded bg-muted" />
          <div className="h-4 w-96 max-w-full rounded bg-muted/60" />
          <div className="space-y-3 pt-4">
            {optionPlaceholders.map((i) => (
              <div key={i} className="h-14 rounded-2xl bg-muted/40" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
