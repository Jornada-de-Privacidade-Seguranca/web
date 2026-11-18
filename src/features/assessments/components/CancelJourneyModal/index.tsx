"use client";

import { useEffect, useRef } from "react";
import { Button } from "@/components/ui";
import { AlertCircleIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useCancelJourneyModalVM } from "./cancelJourneyModal.viewmodel";
import type { CancelJourneyModalProps } from "./cancelJourneyModal.types";

export function CancelJourneyModal(props: CancelJourneyModalProps) {
  const {
    isOpen,
    title,
    description,
    keepLabel,
    confirmText,
    isConfirming,
    errorMessage,
    onCancel,
    onConfirm,
  } = useCancelJourneyModalVM(props);

  const dialogRef = useRef<HTMLDivElement>(null);
  const keepButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (isOpen) {
      keepButtonRef.current?.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onCancel();
        return;
      }

      if (event.key === "Tab") {
        if (!dialogRef.current) return;

        const focusable = dialogRef.current.querySelectorAll<HTMLElement>(
          'button:not([disabled]), [tabindex]:not([tabindex="-1"])'
        );

        if (focusable.length === 0) return;

        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (event.shiftKey) {
          if (document.activeElement === first) {
            event.preventDefault();
            last.focus();
          }
        } else {
          if (document.activeElement === last) {
            event.preventDefault();
            first.focus();
          }
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-4 backdrop-blur-sm animate-in fade-in-0"
      role="presentation"
      onClick={onCancel}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="cancel-modal-title"
        aria-describedby="cancel-modal-desc"
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md rounded-3xl border border-border/80 bg-card p-6 shadow-2xl animate-in zoom-in-95"
      >
        <div className="flex items-start gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-destructive/15 text-destructive ring-1 ring-destructive/20">
            <HugeiconsIcon icon={AlertCircleIcon} size={22} />
          </div>
          <div>
            <h2
              id="cancel-modal-title"
              className="font-heading text-lg font-bold text-card-foreground"
            >
              {title}
            </h2>
            <p
              id="cancel-modal-desc"
              className="mt-2 text-sm text-muted-foreground leading-relaxed"
            >
              {description}
            </p>
          </div>
        </div>

        {errorMessage && (
          <div
            role="alert"
            className="mt-4 rounded-2xl border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive"
          >
            {errorMessage}
          </div>
        )}

        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end sm:gap-3">
          <Button
            ref={keepButtonRef}
            variant="outline"
            onClick={onCancel}
            disabled={isConfirming}
            className="w-full sm:w-auto rounded-full"
          >
            {keepLabel}
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            disabled={isConfirming}
            aria-busy={isConfirming}
            className="w-full sm:w-auto rounded-full"
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </div>
  );
}

