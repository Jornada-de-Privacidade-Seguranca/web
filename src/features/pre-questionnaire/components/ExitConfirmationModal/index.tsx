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

  const dialogRef = useRef<HTMLDivElement>(null);
  const cancelButtonRef = useRef<HTMLButtonElement>(null);
  const previousActiveElementRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      previousActiveElementRef.current = document.activeElement as HTMLElement;
      cancelButtonRef.current?.focus();
    } else {
      previousActiveElementRef.current?.focus();
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

        const focusableElements = dialogRef.current.querySelectorAll<HTMLElement>(
          'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
        );

        if (focusableElements.length === 0) return;

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (event.shiftKey) {
          if (
            document.activeElement === firstElement ||
            !dialogRef.current.contains(document.activeElement)
          ) {
            event.preventDefault();
            lastElement.focus();
          }
        } else {
          if (
            document.activeElement === lastElement ||
            !dialogRef.current.contains(document.activeElement)
          ) {
            event.preventDefault();
            firstElement.focus();
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
