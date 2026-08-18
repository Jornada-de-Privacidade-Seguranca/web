"use client";

import { AlertCircleIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useEmptyStateVM } from "./emptyState.viewmodel";
import type { EmptyStateProps } from "./emptyState.types";

export function EmptyState(props: EmptyStateProps) {
  const { message } = useEmptyStateVM(props);

  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/80 bg-card/40 p-8 text-center backdrop-blur-sm">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground mb-3">
        <HugeiconsIcon icon={AlertCircleIcon} size={24} />
      </div>
      <p className="text-sm font-medium text-muted-foreground">{message}</p>
    </div>
  );
}
