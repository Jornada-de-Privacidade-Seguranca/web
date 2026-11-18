"use client";

import { RefreshIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Button } from "@/components/ui";
import { useAdminResultsErrorStateVM } from "./adminResultsErrorState.viewmodel";
import type { AdminResultsErrorStateProps } from "./adminResultsErrorState.types";

/** Aviso de erro de uma seção da tela, com o botão "Tentar novamente" só daquela seção. */
export function AdminResultsErrorState(props: AdminResultsErrorStateProps) {
  const { testId, title, message, retryLabel, onRetry } = useAdminResultsErrorStateVM(props);

  return (
    <div
      role="alert"
      data-testid={testId}
      className="flex flex-col items-center justify-center space-y-3 rounded-3xl border border-destructive/30 bg-destructive/5 p-6 text-center"
    >
      <p className="font-heading text-sm font-bold text-destructive">{title}</p>
      <p className="text-xs text-destructive/90">{message}</p>
      <Button type="button" onClick={onRetry} variant="outline" size="sm">
        <HugeiconsIcon icon={RefreshIcon} size={14} aria-hidden="true" className="mr-1.5" />
        {retryLabel}
      </Button>
    </div>
  );
}

export * from "./adminResultsErrorState.types";
