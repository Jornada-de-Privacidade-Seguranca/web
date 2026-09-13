"use client";

import { useEffect, useRef } from "react";
import { Button } from "@components/ui";
import { useExitConfirmationModalVM } from "./exitConfirmationModal.viewmodel";
import type { ExitConfirmationModalProps } from "./exitConfirmationModal.types";

export function ExitConfirmationModal(props: ExitConfirmationModalProps) {
  const {
    isOpen,
    title,
    description,
    cancelLabel,
    confirmLabel,
    onCancel,
    onConfirm,
  } = useExitConfirmationModalVM(props);

  const cancelButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (isOpen) {
      cancelButtonRef.current?.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && isOpen) {
        onCancel();
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
        role="dialog"
        aria-modal="true"
        aria-labelledby="exit-modal-title"
        aria-describedby="exit-modal-description"
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md rounded-3xl border border-border/80 bg-card p-6 shadow-2xl animate-in zoom-in-95"
      >
        <h2
          id="exit-modal-title"
          className="font-heading text-lg font-bold text-card-foreground"
        >
          {title}
        </h2>
        <p
          id="exit-modal-description"
          className="mt-2 text-sm text-muted-foreground leading-relaxed"
        >
          {description}
        </p>

        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end sm:gap-3">
          <Button
            ref={cancelButtonRef}
            variant="outline"
            onClick={onCancel}
            className="w-full sm:w-auto"
          >
            {cancelLabel}
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            className="w-full sm:w-auto"
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
