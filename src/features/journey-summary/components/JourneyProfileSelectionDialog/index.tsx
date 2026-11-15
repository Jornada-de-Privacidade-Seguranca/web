"use client";

import { AlertDialog } from "radix-ui";
import { Button } from "@components/ui";
import { useJourneyProfileSelectionDialogVM } from "./journeyProfileSelectionDialog.viewmodel";
import type { JourneyProfileSelectionDialogProps } from "./journeyProfileSelectionDialog.types";

/**
 * Confirma o perfil de jornada inicial antes de criar a primeira jornada. A
 * confirmação salva o perfil e cria a jornada; o diálogo só fecha ao cancelar.
 */
export function JourneyProfileSelectionDialog(props: JourneyProfileSelectionDialogProps) {
  const {
    isOpen,
    isConfirming,
    title,
    description,
    warning,
    error,
    cancelLabel,
    confirmLabel,
    confirmingLabel,
    onConfirm,
    handleOpenChange,
  } = useJourneyProfileSelectionDialogVM(props);

  return (
    <AlertDialog.Root open={isOpen} onOpenChange={handleOpenChange}>
      <AlertDialog.Portal>
        <AlertDialog.Overlay className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm animate-in fade-in-0" />
        <AlertDialog.Content className="fixed left-1/2 top-1/2 z-50 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-3xl border border-border/80 bg-card p-6 shadow-2xl animate-in zoom-in-95">
          <AlertDialog.Title className="font-heading text-lg font-bold text-card-foreground">
            {title}
          </AlertDialog.Title>
          <AlertDialog.Description className="mt-2 text-sm leading-relaxed text-muted-foreground">
            {description}
          </AlertDialog.Description>
          <p className="mt-3 text-sm font-medium text-foreground">{warning}</p>

          {error && (
            <p
              role="alert"
              className="mt-4 rounded-2xl border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive"
            >
              {error}
            </p>
          )}

          <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end sm:gap-3">
            <AlertDialog.Cancel asChild>
              <Button
                variant="outline"
                disabled={isConfirming}
                className="w-full sm:w-auto"
              >
                {cancelLabel}
              </Button>
            </AlertDialog.Cancel>
            <Button
              onClick={onConfirm}
              disabled={isConfirming}
              aria-busy={isConfirming}
              className="w-full sm:w-auto"
            >
              {isConfirming ? confirmingLabel : confirmLabel}
            </Button>
          </div>
        </AlertDialog.Content>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
}
