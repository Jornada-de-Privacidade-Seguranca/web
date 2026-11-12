"use client";

import { useEffect, useRef } from "react";
import { Button } from "@/components/ui";
import { useCancelAssignmentModalVM } from "./cancelAssignmentModal.viewmodel";
import type { CancelAssignmentModalProps } from "./cancelAssignmentModal.types";

export function CancelAssignmentModal(props: CancelAssignmentModalProps) {
  const {
    isOpen,
    title,
    description,
    keepText,
    confirmText,
    cancellingText,
    isCancelling,
    onKeep,
    onConfirm,
  } = useCancelAssignmentModalVM(props);

  const keepButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (isOpen) {
      keepButtonRef.current?.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !isCancelling) {
        onKeep();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isCancelling, onKeep]);

  if (!isOpen) return null;

  return (
    <div
      role="presentation"
      onClick={() => {
        if (!isCancelling) onKeep();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-4 backdrop-blur-sm animate-in fade-in-0"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="cancel-assignment-modal-title"
        aria-describedby="cancel-assignment-modal-description"
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md rounded-3xl border border-destructive/30 bg-card p-6 shadow-2xl animate-in zoom-in-95"
      >
        <h3
          id="cancel-assignment-modal-title"
          className="font-heading text-lg font-bold text-destructive"
        >
          {title}
        </h3>
        <p
          id="cancel-assignment-modal-description"
          className="mt-2 text-xs text-muted-foreground leading-relaxed"
        >
          {description}
        </p>

        <div className="mt-6 flex flex-col-reverse sm:flex-row items-center justify-end gap-3">
          <Button
            ref={keepButtonRef}
            type="button"
            variant="outline"
            size="sm"
            onClick={onKeep}
            disabled={isCancelling}
            className="w-full sm:w-auto rounded-full text-xs font-semibold"
          >
            {keepText}
          </Button>
          <Button
            type="button"
            variant="destructive"
            size="sm"
            onClick={onConfirm}
            disabled={isCancelling}
            className="w-full sm:w-auto rounded-full text-xs font-semibold shadow-md"
          >
            {isCancelling ? cancellingText : confirmText}
          </Button>
        </div>
      </div>
    </div>
  );
}

export * from "./cancelAssignmentModal.types";

