"use client";

import { useEffect, useRef } from "react";
import { InformationCircleIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Button, DomainBadge } from "@/components/ui";
import { useAssignJourneyModalVM } from "./assignJourneyModal.viewmodel";
import type { AssignJourneyModalProps } from "./assignJourneyModal.types";

export function AssignJourneyModal(props: AssignJourneyModalProps) {
  const {
    isOpen,
    options,
    isFirstJourney,
    selectedProfileId,
    isSubmitting,
    canConfirm,
    labels,
    onSelectProfile,
    onCancel,
    onConfirm,
  } = useAssignJourneyModalVM(props);

  const cancelButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (isOpen) {
      cancelButtonRef.current?.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !isSubmitting) {
        onCancel();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isSubmitting, onCancel]);

  if (!isOpen) return null;

  return (
    <div
      role="presentation"
      onClick={() => {
        if (!isSubmitting) onCancel();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-4 backdrop-blur-sm animate-in fade-in-0"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="assign-journey-modal-title"
        aria-describedby="assign-journey-modal-description"
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg rounded-3xl border border-border/80 bg-card p-6 shadow-2xl animate-in zoom-in-95 space-y-5"
      >
        <div>
          <h3
            id="assign-journey-modal-title"
            className="font-heading text-lg font-bold text-foreground"
          >
            {labels.modalTitle}
          </h3>
          <p
            id="assign-journey-modal-description"
            className="mt-1 text-xs text-muted-foreground leading-relaxed"
          >
            {labels.modalDescription}
          </p>
        </div>

        {isFirstJourney && (
          <div className="flex items-start gap-2.5 rounded-2xl border border-primary/20 bg-primary/5 p-3.5 text-xs text-foreground">
            <HugeiconsIcon
              icon={InformationCircleIcon}
              size={18}
              className="mt-0.5 shrink-0 text-primary"
            />
            <p className="leading-relaxed">{labels.firstJourneyNotice}</p>
          </div>
        )}

        <div
          role="radiogroup"
          aria-labelledby="assign-journey-modal-title"
          className="max-h-72 space-y-2.5 overflow-y-auto pr-1"
        >
          {options.map((option) => {
            const isSelected = selectedProfileId === option.id;
            return (
              <label
                key={option.id}
                className={`flex cursor-pointer items-center justify-between gap-3 rounded-2xl border p-3.5 transition-colors ${
                  isSelected
                    ? "border-primary bg-primary/5"
                    : "border-border/80 bg-background/60 hover:border-primary/40"
                }`}
              >
                <span className="flex min-w-0 items-center gap-3">
                  <input
                    type="radio"
                    name="assign-journey-profile"
                    value={option.id}
                    checked={isSelected}
                    disabled={isSubmitting}
                    onChange={() => onSelectProfile(option.id)}
                  />
                  <span className="truncate text-sm font-medium text-foreground">
                    {option.name}
                  </span>
                </span>
                <DomainBadge label={option.domainLabel} />
              </label>
            );
          })}
        </div>

        <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-3 pt-1">
          <Button
            ref={cancelButtonRef}
            type="button"
            variant="outline"
            size="sm"
            onClick={onCancel}
            disabled={isSubmitting}
            className="w-full sm:w-auto rounded-full text-xs font-semibold"
          >
            {labels.cancel}
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={onConfirm}
            disabled={!canConfirm}
            className="w-full sm:w-auto rounded-full text-xs font-semibold shadow-md"
          >
            {isSubmitting ? labels.submitting : labels.confirm}
          </Button>
        </div>
      </div>
    </div>
  );
}

export * from "./assignJourneyModal.types";

