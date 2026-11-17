"use client";

import { useEffect, useRef } from "react";
import { Button } from "@/components/ui";
import { useDeleteUserModalVM } from "./deleteUserModal.viewmodel";
import type { DeleteUserModalProps } from "./deleteUserModal.types";

export function DeleteUserModal(props: DeleteUserModalProps) {
  const {
    isOpen,
    title,
    description,
    cancelText,
    confirmText,
    deletingText,
    errorMessage,
    isDeleting,
    onCancel,
    onConfirm,
  } = useDeleteUserModalVM(props);

  const dialogRef = useRef<HTMLDivElement>(null);
  const cancelButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (isOpen) {
      cancelButtonRef.current?.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onCancel();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  return (
    <div
      role="presentation"
      onClick={onCancel}
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-4 backdrop-blur-sm animate-in fade-in-0"
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-modal-title"
        aria-describedby="delete-modal-description"
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md rounded-3xl border border-destructive/30 bg-card p-6 shadow-2xl animate-in zoom-in-95"
      >
        <h3
          id="delete-modal-title"
          className="font-heading text-lg font-bold text-destructive"
        >
          {title}
        </h3>
        <p
          id="delete-modal-description"
          className="mt-2 text-xs text-muted-foreground leading-relaxed"
        >
          {description}
        </p>

        {errorMessage && (
          <p role="alert" className="mt-4 text-xs font-medium text-destructive">
            {errorMessage}
          </p>
        )}

        <div className="mt-6 flex flex-col-reverse sm:flex-row items-center justify-end gap-3">
          <Button
            ref={cancelButtonRef}
            type="button"
            variant="outline"
            size="sm"
            onClick={onCancel}
            disabled={isDeleting}
            className="w-full sm:w-auto rounded-full text-xs font-semibold"
          >
            {cancelText}
          </Button>
          <Button
            type="button"
            variant="destructive"
            size="sm"
            onClick={onConfirm}
            disabled={isDeleting}
            className="w-full sm:w-auto rounded-full text-xs font-semibold shadow-md"
          >
            {isDeleting ? deletingText : confirmText}
          </Button>
        </div>
      </div>
    </div>
  );
}

export * from "./deleteUserModal.types";
